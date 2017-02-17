import os
import json
import requests


#function for debugging
def pp(output):
	print (json.dumps(output, indent=2))



#function to get an ArchivesSpace session
def getSession():

		
	#inital request for session
	r = requests.post("http://localhost:8089/users/admin/login", data = {"password":"admin"})
	print ("ASpace Connection Successful")
	sessionID = r.json()["session"]
	session = {'X-ArchivesSpace-Session':sessionID}
	return session
		
session = getSession()

query = "nam_apap101"

response = requests.get("http://localhost:8089/repositories/2/search?page=1&aq={\"query\":{\"field\":\"identifier\", \"value\":\"" + query + "\", \"jsonmodel_type\":\"field_query\"}}",  headers=session)
print response
pp(response.json())