--DROP TABLE osm_obj;
--DROP TABLE osm_user
--DROP TABLE osm_date;

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


INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (510836,'Rub21','0171C5',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (1240849,'ediyes','FFFF00',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (1829683,'Luis36995','00FF00',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (2219338,'RichRico','EE3344',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (2226712,'dannykath','662289',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (94578,'andygol','3E8380',true);



SELECT iduser, osmuser, color, estado FROM osm_user;

--selecion

SELECT idfile, osmdate FROM osm_date;


--POR HORA
SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,0,14) as osmd, (o.node_v1 + o.node_vx) as node , (o.way_v1 + o.way_vx) as way, (o.relation_v1+ o.relation_vx) as relation  
FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser WHERE o.osmdate> 1416114000 AND o.osmdate<1416459600


--POR Dia
SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,0,11) as osmd, sum(o.node_v1 + o.node_vx) as node , sum(o.way_v1 + o.way_vx) as way, sum(o.relation_v1+ o.relation_vx) as relation  
FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser 
WHERE osmdate> 1416114000 AND osmdate<1416459600 
GROUP BY osmd,u.osmuser ORDER BY osmd 



--POR MES
SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,0,8) as osmd, sum(o.node_v1 + o.node_vx) as node , sum(o.way_v1 + o.way_vx) as way, sum(o.relation_v1+ o.relation_vx) as relation  
FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser 
GROUP BY osmd,u.osmuser ORDER BY osmd 


--POR TOTAL
SELECT u.osmuser, '2014' as osmd sum(o.node_v1 + o.node_vx) as node , sum(o.way_v1 + o.way_vx) as way, sum(o.relation_v1+ o.relation_vx) as relation  
FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser 
GROUP BY u.osmuser 





 SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,0,8) as osmd, sum(o.node_v1 + o.node_vx) as node , sum(o.way_v1 + o.way_vx) as way, sum(o.relation_v1+ o.relation_vx) as relation  FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser  group BY osmd,u.osmuser ORDER BY osmd;