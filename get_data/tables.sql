--DROP TABLE osm_obj;
--DROP TABLE osm_user
--DROP TABLE osm_date;
--SELECT pg_size_pretty(pg_database_size('dbstatistic'));
CREATE TABLE osm_user(
iduser INTEGER NOT NULL  PRIMARY KEY,
osmuser character(100),
color character(7),
estado boolean not null
);
CREATE TABLE osm_date(
idfile character(10) NOT NULL  PRIMARY KEY ,
osmdate INTEGER
);
CREATE TABLE osm_obj(
iduser INTEGER ,
osmdate INTEGER,
node_v1 INTEGER,
node_vx INTEGER,
way_v1 INTEGER,
way_vx INTEGER,
relation_v1 INTEGER,
relation_vx INTEGER
);
alter table osm_obj
add constraint fk_iduser_osm_obj
Foreign key (iduser)
references osm_user(iduser);
alter table osm_obj
add constraint fk_idfile_osm_obj
Foreign key (osmdate )
references osm_date(osmdate);
ALTER TABLE osm_date ADD CONSTRAINT unique_osmdate UNIQUE (osmdate);