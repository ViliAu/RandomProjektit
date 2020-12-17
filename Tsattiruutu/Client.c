/* Estää winsoket1 paskomast */
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif

#define _WIN32_WINNT 0x0501

#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "portaudio/include/portaudio.h"

/* Laittaa kompiilerin toimimaa */
#pragma comment(lib,"WS2_32")

#define DEFAULT_PORT "6666"
#define DEFAULT_IP "87.93.9.90"
#define BUFF_LEN 512

DWORD WINAPI WriteMessages(void* data);
DWORD WINAPI IOAudio(void* data);

SOCKET connectSocket = 0; //Globaali muuttuja hyi vilile
int commResult, sendResult;

/* PORTAUDIO */
#define SAMPLE_RATE (44100)
#define FRAMES_PER_BUFFER 256
#define SAMPLE_SIZE 4

PaStream* stream;
char* sampleBlockSend = NULL;
char* sampleBlockReceive = NULL;
int numMem;

int main(void) {
    /* Init portaudio */
   /* PORTAUDIO INITIT */
    PaError err = Pa_Initialize();
    if (err != paNoError)
        return 1;

    /* -- setup input and output -- */
    PaStreamParameters inputParameters, outputParameters;
    inputParameters.device = Pa_GetDefaultInputDevice(); /* default input device */
    inputParameters.channelCount = 1;
    inputParameters.sampleFormat = paFloat32;
    inputParameters.suggestedLatency = Pa_GetDeviceInfo(inputParameters.device)->defaultHighInputLatency;
    inputParameters.hostApiSpecificStreamInfo = NULL;

    outputParameters.device = Pa_GetDefaultOutputDevice(); /* default output device */
    outputParameters.channelCount = 1;
    outputParameters.sampleFormat = paFloat32;
    outputParameters.suggestedLatency = Pa_GetDeviceInfo(outputParameters.device)->defaultHighOutputLatency;
    outputParameters.hostApiSpecificStreamInfo = NULL;

    /* TODO: Ehkä stereo tuki???? */
    /* Blocking, so no callback. No callback, so no callback userData */
    err = Pa_OpenStream(&stream, &inputParameters, &outputParameters, SAMPLE_RATE, FRAMES_PER_BUFFER, paClipOff, NULL, NULL);

    numMem = FRAMES_PER_BUFFER * SAMPLE_SIZE * Pa_GetDeviceInfo(inputParameters.device)->maxInputChannels;
    sampleBlockReceive = sampleBlockSend = (char*)malloc(numMem);
    memset(sampleBlockReceive, 0.0f, numMem);

    /* Result for initializations */
    int initResult, voiceChat;

    //Pa_Initialize();

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
    gets(buff);
    if (strlen(buff) == 0) {
        strcat(buff, DEFAULT_IP);
    }

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
    //SOCKET connectSocket = INVALID_SOCKET;

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

    //char receiveBuff[BUFF_LEN] = "";
    char receiveBuff[BUFF_LEN] = "";

    /* Start a new thread for receiving messages */
    HANDLE thread = CreateThread(NULL, 0, WriteMessages, NULL, 0, NULL);
    HANDLE thread2 = CreateThread(NULL, 0, IOAudio, NULL, 0, NULL);

    /* Tsatti pystys */
    while (1) {
        commResult = recv(connectSocket, receiveBuff, BUFF_LEN, 0);
        /*if (commResult < 0) {
            printf("LOPPU");
            break;
        }*/
        printf("%s\n", receiveBuff);
        memset(receiveBuff, 0, sizeof(receiveBuff));
    }
    WSACleanup();
    err = Pa_StopStream(stream);
    err = Pa_CloseStream(stream);
    err = Pa_Terminate();
    getchar();
    return 0;
}

DWORD WINAPI WriteMessages(void* data) {
    char sendBuff[BUFF_LEN];
    char sendMsg[BUFF_LEN - 20];
    char chatName[20];
    char timeStamp[20];
    time_t currentTime;
    
    printf("Input a name (max. 20 chars): ");
    gets(chatName);

    while (fgets(sendMsg, BUFF_LEN - 1, stdin)) {
        if (sendResult == SOCKET_ERROR) {
            printf("Send failed: %d\n", WSAGetLastError());
            return 1;
        }
        time(&currentTime);
        strftime(timeStamp, 20, "[31m[%d.%m.%Y %H.%M] ", localtime(&currentTime));
        strcat(sendBuff, timeStamp);
        strcat(sendBuff, chatName);
        strcat(sendBuff, ": ");
        strcat(sendBuff, sendMsg);
        sendResult = send(connectSocket, sendBuff, (int)strlen(sendBuff), 0);
        sendResult = 0;
        printf("%sMe: %s\n", timeStamp, sendMsg);
        memset(sendBuff, 0, sizeof(sendBuff));
        memset(sendBuff, 0, sizeof(sendMsg));
    }
    printf("LOPPU");
    return 0;
}

DWORD WINAPI IOAudio(void* data) {
    PaError err = Pa_StartStream(stream);
    if (err != paNoError) {
        printf("Vituiks meni %d", err);
        return 1;
    }
    while (1) {
        err = Pa_ReadStream(stream, sampleBlockSend, FRAMES_PER_BUFFER);
        if (err != paNoError) {
            printf("Vituiks meni lah %d", err);
            return 1;
        }
        send(connectSocket, sampleBlockSend, BUFF_LEN, 1);

        recv(connectSocket, sampleBlockReceive, BUFF_LEN, 1);
        err = Pa_WriteStream(stream, sampleBlockReceive, FRAMES_PER_BUFFER);
        if (err != paNoError) {
            printf("Vituiks meni kirjotus %d", err);
            return 1;
        }

        //printf("Receive: %d, Send: %d \n", (int)strlen(sampleBlockSend), (int)strlen(sampleBlockReceive));
    }
}
