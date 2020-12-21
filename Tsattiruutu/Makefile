all: client.c server.c
	gcc client.c -o client.exe -lws2_32 -fPIC -lportaudio -static-libgcc -static-libstdc++
	gcc server.c -o server.exe -lws2_32 -fPIC -lportaudio -static-libgcc -static-libstdc++
	