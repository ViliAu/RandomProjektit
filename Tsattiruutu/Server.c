/* Est‰‰ winsoket1 paskomast */
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif

#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdio.h>
#include <stdlib.h>

/* Laittaa kompiilerin toimimaa */
#pragma comment(lib,"WS2_32")

#define DEFAULT_PORT "666"
#define MAX_CONNECTIONS 2
#define BUFF_LEN 512

DWORD WINAPI ReceiveMessages(void *data);

int main(void) {
    /* Result for initializations */
    int initResult;

    /* INITIALIZING WSADll */
    WSADATA wsaData;
    // K‰ynnist‰ tsoketti ver. 2.2
    initResult = WSAStartup(MAKEWORD(2,2), &wsaData);
    if (initResult != 0) {
        printf("WSAStartup failed: %d\n", initResult);
        getchar();
        return 1;
    }
    printf("WSAStartup successful.\n");

    /* CREATING A SOCKET */
    /* Host address information */
    struct addrinfo *result = NULL, *ptr = NULL, hints;

    ZeroMemory(&hints, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_protocol = IPPROTO_TCP;
    hints.ai_flags = AI_PASSIVE;

    /* Resolve the local address and port to be used by the server */
    initResult = getaddrinfo(NULL, DEFAULT_PORT, &hints, &result);
    if (initResult != 0) {
        printf("Getaddrinfo failed: %d\n", initResult);
        WSACleanup();
        return 1;
    }
    printf("Host address resolved.\n");

    /* Create a socket for listening the client and assign it's addresses */
    SOCKET listenSocket = INVALID_SOCKET;
    listenSocket = socket(result->ai_family, result->ai_socktype, result->ai_protocol);
    /* Socket error check */
    if (listenSocket == INVALID_SOCKET) {
        printf("Error at socket(): %ld\n", WSAGetLastError());
        freeaddrinfo(result);
        WSACleanup();
        return 1;
    }
    printf("Socket created. %d\n", listenSocket);

    /* BINDING A SOCKET TO AN ADDRESS */
    // Setup the TCP listening socket
    initResult = bind(listenSocket, result->ai_addr, (int)result->ai_addrlen);
    if (initResult == SOCKET_ERROR) {
        printf("Bind failed with error: %d\n", WSAGetLastError());
        freeaddrinfo(result);
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }
    printf("Socket bound.\n");
    freeaddrinfo(result);

    /* LISTEN TO SOCKET */
    if (listen(listenSocket, MAX_CONNECTIONS) == SOCKET_ERROR) {
        printf("Listen failed with error: %ld\n", WSAGetLastError());
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }
    printf("Listening to port %s...\n", DEFAULT_PORT);

    // TODO: Useiden clienttien tuki?
    SOCKET clientSocket = 0;

    // Accept a client socket
    clientSocket = accept(listenSocket, NULL, NULL);
    if (clientSocket == INVALID_SOCKET) {
        printf("accept failed: %d\n", WSAGetLastError());
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }

    printf("Client accepted.\n");

    char sendBuff[BUFF_LEN];
    char receiveBuff[BUFF_LEN];
    int commResult;
    int i;
    
    /* Start a new thread for receiving messages */
    //HANDLE thread = CreateThread(NULL, 0, ReceiveMessages, NULL, 0, NULL);

    /* Tsatti pystys */
    while (1) {
        printf("Me: ");
        fgets(sendBuff, BUFF_LEN - 1, stdin);
        printf("\n");
        commResult = send(clientSocket, sendBuff, (int)strlen(sendBuff), 0);
        if (!strcmp(sendBuff, "-exit")) {
            break;
        }
        if (commResult == SOCKET_ERROR) {
            printf("Couldn't send packets to client: %d\n", WSAGetLastError());
            closesocket(clientSocket);
            WSACleanup();
            getchar();
            return 1;
        }
        for (int i = 0; i < BUFF_LEN; i++) {
            sendBuff[i] = 0;
        }
    }
    getchar();
    return 0;
}
/*
DWORD WINAPI ReceiveMessages(void *data) {
    int commResult;
    while (1) {
        commResult = recv(clientSocket, receiveBuff, BUFF_LEN, 0);
        if (initResult < 0) {
            printf("Couldn't receive message.\n");
            continue;
        }
         
        if (strcmp(receiveBuff, "-exit")) {
            break;
        }
        else {
            printf("Them: %s\n", receiveBuff);
        }
    }
    commResult = shutdown(clientSocket, SD_SEND);

    closesocket(clientSocket);
    WSACleanup();
    return 0;
}*/