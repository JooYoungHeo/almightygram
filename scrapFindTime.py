import urllib2
from bs4 import BeautifulSoup

url = 'http://www.findtime.co.kr/1%ED%98%B8%EC%84%A0-%EA%B0%80%EB%8A%A5%EC%97%AD-%EC%8B%9C%EA%B0%84%ED%91%9C-%EA%B0%80%EB%8A%A5%EC%97%AD-%EC%8B%9C%EA%B0%84%ED%91%9C/';
page = urllib2.urlopen(url).read()
soup = BeautifulSoup(page, 'html.parser');

tables = soup.find_all('table', {'class': 'type01'})
for table in tables:
    print(table.thead.tr.th.text)
