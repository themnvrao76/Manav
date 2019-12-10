import requests
from pprint import pprint

Movie =input("Enter Movie Name")
res=requests.get(url=f"http://www.omdbapi.com/?t={Movie}&apikey=554f2ad")#api key
data=res.json()
Title=data['Title']
Year=data['Year']
Released=data['Released']
Runtime=data['Runtime']
Genre=data['Genre']
Director=data['Director']
Actors=data['Actors']
imdbRating=data['imdbRating']

#printing data of movie 
print(f"Title :{Title}") #title
print(f"Year :{Year}")
print(f"Released :{Released}")
print(f"Runtime : {Runtime}")
print(f"Genre :{Genre}")
print(f"Director : {Director}")
print(f"Actors :{Actors}")
print(f"imdbRating : {imdbRating}")