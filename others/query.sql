-- Usuarios

INSERT INTO osm_user(osm_user,color) VALUES ("Rub21","0171C5");
INSERT INTO osm_user(osm_user,color) VALUES ("ediyes","FFFF00");
INSERT INTO osm_user(osm_user,color) VALUES ("Luis36995","00FF00");
INSERT INTO osm_user(osm_user,color) VALUES ("RichRico","EE3344");
INSERT INTO osm_user(osm_user,color) VALUES ("dannykath","662289");
select * from osm_user;



## ULTIMA CONSLTA OPTIMIZADA
## sin parametro
SELECT (high_vx+high_v1) as high_total, U. osm_user, U. id_user, D.osm_date FROM osm_highway AS H LEFT JOIN osm_user AS U ON U.id_user=H.id_user LEFT JOIN osm_date as D ON H.id_date=D.id_date

# Con Parametro
SELECT (high_vx+high_v1) as high_total, U. osm_user, U. id_user, substr( D.osm_date,0,11) as date ,substr(D.osm_date,12) as hour FROM osm_highway AS H LEFT JOIN osm_user AS U ON U.id_user=H.id_user LEFT JOIN osm_date as D ON H.id_date=D.id_date WHERE date='2014-10-03'

## por hora en varios dias
SELECT (high_vx+high_v1) as high_total, U. osm_user, U. id_user, substr( D.osm_date,0,8) as month ,substr(D.osm_date,9,2) as day FROM osm_highway AS H LEFT JOIN osm_user AS U ON U.id_user=H.id_user LEFT JOIN osm_date as D ON H.id_date=D.id_date WHERE month='2014-11'

# Reporte por dia
SELECT SUM(high_vx+high_v1) as high_total, U. osm_user, U. id_user, substr( D.osm_date,0,8) as month ,substr(D.osm_date,9,2) as day FROM osm_highway AS H LEFT JOIN osm_user AS U ON U.id_user=H.id_user LEFT JOIN osm_date as D ON H.id_date=D.id_date WHERE month='2014-11' AND day='11' GROUP BY U. osm_user ORDER BY high_total DESC 

# PER MOTNH
SELECT SUM(high_vx+high_v1) as high_total, U. osm_user, U. id_user, substr( D.osm_date,0,8) as month ,substr(D.osm_date,9,2) as day FROM osm_highway AS H LEFT JOIN osm_user AS U ON U.id_user=H.id_user LEFT JOIN osm_date as D ON H.id_date=D.id_date WHERE month='2014-11'  GROUP BY U. osm_user ORDER BY high_total DESC 



SELECT  strftime('%s',  substr( osm_date,0,11)  || ' 00:00:00' ) as int_date FROM  osm_date;



