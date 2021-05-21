import getopt
import os
import socket
import sys
from http import HTTPStatus
from http.client import HTTPConnection, HTTPSConnection


class StateReporter():
    def __init__(self, oh_host='localhost', oh_port=8080, ga_host='', ga_port=443, ga_user=''):
        self.oh_host = oh_host
        self.oh_port = oh_port
        self.ga_host = ga_host
        self.ga_port = ga_port
        self.ga_user = ga_user

        if not self.ga_host:
            raise StateReporter.GaHostMissingError

        if not self.ga_user:
            raise StateReporter.GaUserMissingError

    def update_state(self, item_name):
        try:
            if self.oh_port == 443:
                http_get = HTTPSConnection(host=self.oh_host, port=self.oh_port, timeout=3)
            else:
                http_get = HTTPConnection(host=self.oh_host, port=self.oh_port, timeout=3)
            http_get.request('GET', '/rest/items/' + item_name + '?metadata=ga,synonyms')
            response = http_get.getresponse()
            if response.status == HTTPStatus.NOT_FOUND:
                raise StateReporter.ItemNotFoundError
            if response.status != HTTPStatus.OK:
                raise StateReporter.ApiConnectionError
            result = response.read()

        except socket.timeout:
            raise StateReporter.ApiConnectionError

        try:
            if self.ga_port == 443:
                http_post = HTTPSConnection(host=self.ga_host, port=self.ga_port, timeout=3)
            else:
                http_post = HTTPConnection(host=self.ga_host, port=self.ga_port, timeout=3)
            headers = {'Content-Type': 'application/json', 'x-openhab-user': self.ga_user}
            http_post.request('POST', '/reportstate', result, headers=headers)
            response = http_post.getresponse()
            if response.status != HTTPStatus.OK:
                raise StateReporter.GaConnectionError
            result = response.read()

        except socket.timeout:
            raise StateReporter.GaConnectionError

        return None

    class ItemNotFoundError(Exception):
        """
        Exception raised when ...
        """

        pass

    class ApiConnectionError(Exception):
        """
        Exception raised when ...
        """

        pass

    class GaConnectionError(Exception):
        """
        Exception raised when ...
        """

        pass

    class GaHostMissingError(Exception):
        """
        Exception raised when ...
        """

        pass

    class GaUserMissingError(Exception):
        """
        Exception raised when ...
        """

        pass

if __name__ == "__main__":
    opts = None

    try:
        opts, args = getopt.getopt(sys.argv[1:], "ho:p:g:a:u:i:", [
                                   "oh-host=", "oh-port=", "ga-host=", "ga-port=", "ga-user=", "item-name="])
    except getopt.GetoptError:
        pass

    oh_host = os.environ.get('SR_OH_HOST', None)
    oh_port = os.environ.get('SR_OH_PORT', 8080)
    ga_host = os.environ.get('SR_GA_HOST', None)
    ga_port = os.environ.get('SR_GA_PORT', 443)
    ga_user = os.environ.get('SR_GA_USER', None)
    item_name = None

    for opt, arg in opts:
        if opt == '-h':
            print('stateReporter.py -o <oh-host> -p <oh-port> -g <ga-host> -a <ga-port> -i <item-name>')
            exit()
        elif opt in ("-o", "--oh-host"):
            oh_host = arg
        elif opt in ("-p", "--oh-port"):
            oh_port = int(arg)
        elif opt in ("-g", "--ga-host"):
            ga_host = arg
        elif opt in ("-a", "--ga-port"):
            ga_port = int(arg)
        elif opt in ("-u", "--ga-user"):
            ga_user = arg
        elif opt in ("-i", "--item-name"):
            item_name = arg

    if not item_name:
        print('No item name given')
        exit(1)

    try:
        reporter = StateReporter(oh_host, oh_port, ga_host, ga_port, ga_user)
        reporter.update_state(item_name)

    except StateReporter.ItemNotFoundError:
        print('No item with given name was found')
        exit(1)

    except StateReporter.GaUserMissingError:
        print('No ga user was given')
        exit(1)

    except StateReporter.GaHostMissingError:
        print('No ga host was given')
        exit(1)

    except StateReporter.ApiConnectionError:
        print('Error while connecting to openHAB API')
        exit(1)

    except StateReporter.GaConnectionError:
        print('Error while connecting to openHAB Google Assistant API')
        exit(1)
