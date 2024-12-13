#include "server/edge_server.h"
#include <iostream>
#include <csignal>

std::unique_ptr<edge::EdgeServer> server;

void signalHandler(int signum)
{
    std::cout << "Interrupt signal (" << signum << ") received.\n";
    if (server)
    {
        server->stop();
    }
    exit(signum);
}

int main()
{
    try
    {
        // 注册信号处理
        signal(SIGINT, signalHandler);
        signal(SIGTERM, signalHandler);

        // 创建并启动服务器
        server = std::make_unique<edge::EdgeServer>("0.0.0.0", 8080);
        server->start();
    }
    catch (std::exception &e)
    {
        std::cerr << "Exception: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}