all: client.c server.c
	gcc -L$(shell pwd)/portaudio/lib/.libs client.c -o client.exe -lws2_32 -fPIC -lportaudio
	gcc -L$(shell pwd)/portaudio/lib/.libs server.c -o server.exe -lws2_32 -fPIC -lportaudio
	