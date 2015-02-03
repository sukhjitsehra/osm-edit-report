# Data team report

Reports editing activity for a number of users on OpenStreetMap.

![](https://s3.amazonaws.com/f.cl.ly/items/020L3h1h0s3g3a3x1T34/Screen%20Shot%202015-02-02%20at%2010.16.03%20PM.png)

## Installation

System requirements:

- Node 0.10.x
- PostGreSQL

### 1. Clone and build project

    git clone https://github.com/mapbox/report-dt.git
    cd report-dt/server && npm install
    cd ../get_data && npm install

### 2. Create and set up the database

I Assume that postgres was installed in your machine.
Create ate you data base `dbstatistic` and create the tables

    postgres createdb dbstatistic
    psql dbstatistic -f get_data/tables.sql

### 3. Add users to database

Add each user whose OpenStreetMap edits you'd like to track to the `osm_user` table like so:

``` sql 
	INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (589596,'lxbarth','FFFF00',true);
```

- **589596** : id user on OpenstreetMap
- **lxbarth** : name of user
- **FFFF00**: color of user for to show in line graph
- **true** : state of user: if you don’t want to show one user on line graph , just update the user using state as false

Example:

https://github.com/mapbox/report-dt/blob/mb-pages/get_data/add_user.sql

### 4. Configure IP

Configure the IP of server in app.js:

https://github.com/mapbox/report-dt/blob/mb-pages/js/app.js#L1-L2

## Load data

To load starting with [2012-10-23 23:02](http://planet.openstreetmap.org/replication/hour/000/001/) run:

    cd get_data/
    node load.js --num_file=1 --num_directory=0

Or if you what to load front exact date, just look this files and set up the `num_file` and `num_directory` 

Example:  From [2015-01-01 00:02](http://planet.openstreetmap.org/replication/hour/000/020/) run:

    cd get_data/
    node load.js --num_file=177 --num_directory=20

## Run server

    cd server/
    node index.js

Use [forever](http://labs.telasocial.com/nodejs-forever-daemon/) to run as a daemon.
