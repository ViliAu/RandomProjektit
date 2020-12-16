/* Estää winsoket1 paskomast */
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
#define BUFF_LEN 512

int main(void) {
    /* Result for initializations */
    int initResult;

    /* INITIALIZING WSADll */
    WSADATA wsaData;
    // Käynnistä tsoketti ver. 2.2
    initResult = WSAStartup(MAKEWORD(2,2), &wsaData);
    if (initResult != 0) {
        printf("WSAStartup failed: %d\n", initResult);
        getchar();
        return 1;
    }
    printf("WSAStartup successful.\n");

    /* CREATING A SOCKET */
    /* Client address information */
    struct addrinfo *result = NULL, *ptr = NULL, hints;

    ZeroMemory(&hints, sizeof(hints));
    hints.ai_family = AF_INET; //IPv4
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_protocol = IPPROTO_TCP;
    hints.ai_flags = AI_PASSIVE;

    /* Get IP */
    char buff[100];
    printf("Give an address to connect to: ");
    gets_s(buff, 99);

    /* Resolve the local address and port to be used by the server */
    initResult = getaddrinfo(buff, DEFAULT_PORT, &hints, &result);
    if (initResult != 0) {
        printf("Getaddrinfo failed: %d\n", initResult);
        WSACleanup();
        getchar();
        return 1;
    }
    printf("Host address resolved.\n");

    /* Create a socket for connecting to the server and assign it's addresses */
    SOCKET connectSocket = INVALID_SOCKET;

    // Attempt to connect to the first address returned by the call to getaddrinfo
    ptr = result;
    connectSocket = socket(ptr->ai_family, ptr->ai_socktype, ptr->ai_protocol);
    /* Socket error check */
    if (connectSocket == INVALID_SOCKET) {
        printf("Error at socket(): %ld\n", WSAGetLastError());
        freeaddrinfo(result);
        WSACleanup();
        getchar();
        return 1;
    }
    printf("Socket created. %d\n", connectSocket);

    /* Connecting to a socket */
    initResult = connect(connectSocket, ptr->ai_addr, ptr->ai_addrlen);
    if (initResult == SOCKET_ERROR) {
        closesocket(connectSocket);
        connectSocket = INVALID_SOCKET;
        printf("Couldn't reach host %s\n", buff);
        freeaddrinfo(result);
        WSACleanup();
        getchar();
        return 1;
    }
    printf("Connected to server!\n");
    getchar();
    return 0;
}