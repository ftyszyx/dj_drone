#include "edge_server.h"
#include <iostream>
#include <string>

int main(int argc, char *argv[])
{
    if (argc != 3)
    {
        std::cout << "Usage: " << argv[0] << " <server_host> <server_port>" << std::endl;
        return 1;
    }

    std::string server_host = argv[1];
    unsigned short server_port = static_cast<unsigned short>(std::stoi(argv[2]));

    edge_app::EdgeServer server(server_host, server_port);

    if (!server.init())
    {
        std::cerr << "Failed to initialize server" << std::endl;
        return 1;
    }

    server.start();
    std::cout << "Server started. Connected to " << server_host << ":" << server_port << std::endl;

    // 简单的命令行接口
    std::string input;
    while (std::getline(std::cin, input))
    {
        if (input == "quit" || input == "exit")
        {
            break;
        }

        if (!server.sendMessage(input))
        {
            std::cerr << "Failed to send message" << std::endl;
        }
    }

    server.stop();
    return 0;
}