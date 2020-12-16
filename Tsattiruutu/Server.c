/* Est‰‰ winsoket1 paskomast */
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif

/* Soketit */
#include <winsock2.h>
/* Protokollat */
#include <ws2tcpip.h>
#include <stdio.h>
/* Laittaa kompiilerin toimimaa */
#pragma comment(lib,"WS2_32")

#define DEFAULT_PORT "666"
#define MAX_CONNECTIONS 2
#define BUFF_LEN 512

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

    getchar();
    return 0;
}