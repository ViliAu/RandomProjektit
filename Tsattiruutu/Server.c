/* Est‰‰ winsoket1 paskomast */
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif

#define _WIN32_WINNT 0x0501

#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include "portaudio/include/portaudio.h"

/* Library link for the compiler */
#pragma comment(lib,"WS2_32.lib")

#define DEFAULT_PORT "6666"
#define MAX_CONNECTIONS 2
#define BUFF_LEN 512

DWORD WINAPI WriteMessages(void* data);
DWORD WINAPI IOAudio(void* data);
DWORD WINAPI AudioIN(void* data);
DWORD WINAPI AudioOUT(void* data);

SOCKET clientSocket = 0; //Globaali muuttuja hyi vilile
SOCKET udpSocket = 0;
int commResult, sendResult;

/* PORTAUDIO */
#define SAMPLE_RATE (20000)
#define FRAMES_PER_BUFFER 256
#define SAMPLE_SIZE 2
#define CHANNELS 1
#define FORMAT paInt16

PaStream* stream;
int numMem;

char* sampleBlockSend = NULL;
char* sampleBlockReceive = NULL;

struct sockaddr_in sender;
int senderSize = sizeof(sender);

int main(void) {
    /* Init portaudio */
    /* PORTAUDIO INITIT */
    PaError err = Pa_Initialize();
    if (err != paNoError)
        return 1;

    /* -- setup input and output -- */
    PaStreamParameters inputParameters, outputParameters;
    inputParameters.device = Pa_GetDefaultInputDevice(); /* default input device */
    inputParameters.channelCount = CHANNELS;
    inputParameters.sampleFormat = FORMAT;
    inputParameters.suggestedLatency = Pa_GetDeviceInfo(inputParameters.device)->defaultHighInputLatency;
    inputParameters.hostApiSpecificStreamInfo = NULL;

    outputParameters.device = Pa_GetDefaultOutputDevice(); /* default output device */
    outputParameters.channelCount = CHANNELS;
    outputParameters.sampleFormat = FORMAT;
    outputParameters.suggestedLatency = Pa_GetDeviceInfo(outputParameters.device)->defaultHighOutputLatency;
    outputParameters.hostApiSpecificStreamInfo = NULL;

    /* TODO: Ehk‰ stereo tuki???? */
 
    /* Blocking, so no callback. No callback, so no callback userData */
    err = Pa_OpenStream(&stream, &inputParameters, &outputParameters, SAMPLE_RATE, FRAMES_PER_BUFFER, paClipOff, NULL, NULL);
    /* Tahan stereo */
    numMem = FRAMES_PER_BUFFER * SAMPLE_SIZE;
    sampleBlockReceive = (char*)malloc(numMem);
    sampleBlockSend = (char*)malloc(numMem);
    memset(sampleBlockReceive, 0.0f, numMem);
    memset(sampleBlockSend, 0.0f, numMem);

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
    struct addrinfo *result = NULL, hints;
    struct sockaddr_in server;

    // TCP
    ZeroMemory(&hints, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_protocol = IPPROTO_TCP;
    hints.ai_flags = AI_PASSIVE;

    // UDP
    server.sin_family = AF_INET;
    server.sin_port = htons(6667);
    server.sin_addr.s_addr = htonl(INADDR_ANY);
    udpSocket = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    bind(udpSocket, (SOCKADDR*)&server, sizeof(server));

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
        printf("Error at socket(): %d\n", WSAGetLastError());
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
        printf("Listen failed with error: %d\n", WSAGetLastError());
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }
    printf("Listening to port %s...\n", DEFAULT_PORT);

    // Accept a client socket
    clientSocket = accept(listenSocket, NULL, NULL);
    
    if (clientSocket == INVALID_SOCKET) {
        printf("accept failed: %d\n", WSAGetLastError());
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }

    printf("Client accepted.\n");

    char receiveBuff[BUFF_LEN] = { 0 };
    char sendBuff[BUFF_LEN] = { 0 };
    
    /* Start a new thread for receiving messages */
    
    // GET UDP BYTES SO WE CAN RESOLVE UDP PARENT ADDR
    printf("Waiting for upd datagrams...\n");
    recvfrom(udpSocket, receiveBuff, BUFF_LEN, 0, (SOCKADDR*)&sender, &senderSize);
    printf("Datagram received!: %s", receiveBuff);

    //HANDLE thread = CreateThread(NULL, 0, WriteMessages, NULL, 0, NULL);
    HANDLE thread2 = CreateThread(NULL, 0, IOAudio, NULL, 0, NULL);

    /* Tsatti pystys */
    while (0) {
        commResult = recv(clientSocket, receiveBuff, BUFF_LEN, 0);
        if ((int)strlen(receiveBuff) > 1) {
            printf("%s\n", receiveBuff);
            memset(receiveBuff, 0, sizeof(receiveBuff));
        }
        memset(receiveBuff, 0, sizeof(receiveBuff));
    }
    getchar();
    WSACleanup();
    return 0;
}

DWORD WINAPI WriteMessages(void *data) {
    char sendBuff[BUFF_LEN];
    char sendMsg[BUFF_LEN-20];
    char chatName[20];
    char timeStamp[20];
    time_t currentTime;

    printf("Input a name (max. 20 chars): ");
    fgets(chatName, sizeof(chatName), stdin);

    while (fgets(sendMsg, BUFF_LEN - 1, stdin)) {
        if (sendResult == SOCKET_ERROR) {
            printf("Send failed: %d\n", WSAGetLastError());
        }
        time(&currentTime);
        strftime(timeStamp, 20, "[%d.%m.%Y %H.%M] ", localtime(&currentTime));
        strcat(sendBuff, timeStamp);
        strcat(sendBuff, chatName);
        strcat(sendBuff, ": ");
        strcat(sendBuff, sendMsg);
        sendResult = send(clientSocket, sendBuff, (int)strlen(sendBuff), 0);
        sendResult = 0;
        printf("%sMe: %s\n", timeStamp, sendMsg);
        memset(sendBuff, 0, sizeof(sendBuff));
        memset(sendBuff, 0, sizeof(sendMsg));
    }
    return 0;
}


DWORD WINAPI IOAudio(void* data) {
    /* Init portaudio */
    PaError err = Pa_StartStream(stream);
    while (1) {
        err = Pa_WriteStream(stream, sampleBlockReceive, FRAMES_PER_BUFFER);
        if (err != paNoError) {
            //printf("Vituiks meni kirjotus %d", err);
            continue;
        }
        err = Pa_ReadStream(stream, sampleBlockSend, FRAMES_PER_BUFFER);
        if (err != paNoError) {
            //printf("Vituiks meni lah %d", err);
            continue;
        }
        //send(clientSocket, sampleBlockSend, numMem, 0);
        sendto(udpSocket, sampleBlockSend, numMem, 0, (SOCKADDR*)&sender, senderSize);
        //recv(clientSocket, sampleBlockReceive, BUFF_LEN, 0);
        recvfrom(udpSocket, sampleBlockReceive, BUFF_LEN, 0, (SOCKADDR*)&sender, &senderSize);
    }
    err = Pa_StopStream(stream);
    err = Pa_CloseStream(stream);
    err = Pa_Terminate();
}
/*
DWORD WINAPI AudioIN(void* data) {
    PaError err;
    while (1) {

    }
}

DWORD WINAPI AudioOUT(void* data) {

}*/