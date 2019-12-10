import requests
from pprint import pprint
import datetime
x="Weather in your city"
print(x.center(30,'*'))
city=input("Enter City Name :")

try:
    url=f"http://api.openweathermap.org/data/2.5/weather?appid=05ff10ed81112489c824ed2cdf636514&q={city}&units=metric"
except:
    print("Data Not Available")

res=requests.get(url)
data=res.json()

try:
    temp=data['main']['temp']
    wind=data['wind']['speed']
    discription=data['weather'][0]['description']
    Country=data['sys']['country']

    print(f"Temprature : {temp} ·C")
    print(f"wind Speed :{wind} m/s")
    print(f"Discription :{discription}")
    print(f"Country : {Country}")
    
except:
    print("Data is not Availble")
