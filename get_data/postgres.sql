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

INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (510836,'Rub21','0171C5',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (1240849,'ediyes','FFFF00',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (1829683,'Luis36995','00FF00',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (2219338,'RichRico','EE3344',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (2226712,'dannykath','662289',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (94578,'andygol','3E8380',true);
INSERT INTO osm_user(iduser, osmuser, color, estado) VALUES (1051550,'shravan91','FF8A00',true);
INSERT INTO osm_user(iduser, osmuser, color, estado) VALUES (2554698,'Ruth Maben','FA58F4',true);


INSERT INTO osm_user(iduser, osmuser, color, estado) VALUES (2377377,'abel801','008000',true);
INSERT INTO osm_user(iduser, osmuser, color, estado) VALUES (2511706,'cesar28','800000',true);
INSERT INTO osm_user(iduser, osmuser, color, estado) VALUES (2512300,'samely','66CCCC',true);

UPDATE osm_user
   SET  color='008000'
 WHERE iduser=2377377;
 

SELECT iduser, osmuser, color, estado FROM osm_user;
--selecion



SELECT iduser, osmuser, color, estado FROM osm_user where estado=true
SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,6,6) as osmd, sum(o.node_v1 + o.node_vx) as node , sum(o.way_v1 + o.way_vx) as way, sum(o.relation_v1+ o.relation_vx) as relation 
 FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser  WHERE osmdate> 1412139600 AND osmdate<1417582800 AND u.estado=true  GROUP BY osmd,u.osmuser ORDER BY osmd;

SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,8,14) as osmd, (o.node_v1 + o.node_vx) as node , (o.way_v1 + o.way_vx) as way, (o.relation_v1+ o.relation_vx) as relation 
 FROM osm_obj as o  INNER JOIN osm_user as u on  u.iduser =  o.iduser WHERE o.osmdate>=1412226000 AND o.osmdate<1412571600 AND u.estado=true

 DELETE FROM osm_obj  WHERE iduser = 2226712  AND osmdate < 1406851200 
 SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,0,5) as osmd, sum(o.node_v1 + o.node_vx) as node , sum(o.way_v1 + o.way_vx) as way, sum(o.relation_v1+ o.relation_vx) as relation 
   FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser  WHERE osmdate>= 1357016400 AND osmdate<1420088400 AND u.estado=true  GROUP BY osmd,u.osmuser ORDER BY osmd

