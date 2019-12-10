from PIL import Image


img=Image.open("cat.jpg")
width,height=img.size
bt=Image.new('RGBA',(width+10,height+(height//3)),'black')
bt.paste(img,(3,3,(width+3),(height+3)))
bt.show()