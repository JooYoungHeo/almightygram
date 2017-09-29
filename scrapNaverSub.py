import urllib2
from bs4 import BeautifulSoup
page = urllib2.urlopen('https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=1&ie=utf8&query=%EA%B0%80%EB%8A%A5%EC%97%AD').read()
soup = BeautifulSoup(page, 'html.parser');

for td in soup.findAll("td", {"class": "mid"}):
    print(td)
