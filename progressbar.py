class Student:
    lst=[]
    roll=0
    name=""
    
    
    def add(self,roll,name):
        self.lst.append(s(self.roll,self.name))
    def print(self):
        for s in self.lst:
            print(s)
s=Student()
s.add(10,"manav")
s.add(0,"Jay")
s.add(20,"Meet")
s.add(3,"Harsh")
s.add(40,"Jeet")
s.add(60,"Swarg")
s.add(10,"Meet")
s.print()