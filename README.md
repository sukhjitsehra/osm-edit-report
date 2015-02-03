# Data team report

Reports editing activity for a number of individuals on OpenStreetMap.

#### 1. Clone the project

`git clone https://github.com/mapbox/report-dt.git`

`cd report-dt/server && npm install`

`cd ../ get_data && npm install`

#### 2. Create and set up the database

I Assume that postgres was installed in your machine.
Create ate you data base `dbstatistic` and create the tables https://github.com/mapbox/report-dt/blob/mb-pages/get_data/tables.sql

#### 3. Add user on data base

You can add many users, for example in our case we add the next user:

https://github.com/mapbox/report-dt/blob/mb-pages/get_data/add_user.sql

If you want to add on future much users just you have to add a line of code in your database:
` INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (2115749,'srividya_c','F8981D',true);`

###### Where:

**2115749** : id user on OpenstreetMap
**srividya_c** : name of user
**F8981D**: color of user for to show in line graph
**true** : state of user: if you don’t want to show one user on line graph , just update the user using state as false

### 4. Start loading data into the database

Go to `report-dt/get_data` 

If you what to load from:  [2012-10-23 23:02]( http://planet.openstreetmap.org/replication/hour/000/001/)

Execute the next line:

`node load.js --num_file=1 --num_directory=0`

Or if you what to load front exact date, just look this files and set up the `num_file` and `num_directory` 

Example:  From ` 2015-01-01 00:02`

`node load.js --num_file=177 --num_directory=20`


### 5. Run REST service

Go to `report-dt/server`

And run 

`node indes.js`

Or if you what to make a server, you can user forever.
