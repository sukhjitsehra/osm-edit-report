INSERT   INTO  osm_user(osm_user,color)  VALUES ("Rub21","0171C5");
INSERT   INTO  osm_user(osm_user,color)  VALUES ("ediyes","FFFF00");
INSERT   INTO  osm_user(osm_user,color)  VALUES ("Luis36995","00FF00");
INSERT   INTO  osm_user(osm_user,color)  VALUES ("RichRico","EE3344");
INSERT   INTO  osm_user(osm_user,color)  VALUES ("dannykath","662289");
select * from osm_user;



//Select 
SELECT id_user,substr(osm_date,0,11) as date , substr(osm_date,12) as hour ,(high_vx+high_v1) as high_total from osm_highway
SELECT substr(osm_date,0,11) as date,substr(osm_date,12) as hour,(high_vx+high_v1) as high_total, osm_user  FROM osm_highway AS C LEFT JOIN  osm_user AS R ON R.id_user=C.id_user WHERE date='2014-10-06'

## uLTIMA cONSLTA OPTIMIZADA

//sin parametro

SELECT   (high_vx+high_v1) as high_total,  U. osm_user,   U. id_user, D.osm_date    FROM osm_highway   AS H   LEFT JOIN  osm_user AS U  ON   U.id_user=H.id_user  LEFT JOIN osm_date as D   ON H.id_date=D.id_date

//Con Parametro
SELECT   (high_vx+high_v1) as high_total,  U. osm_user,   U. id_user, substr( D.osm_date,0,11) as date    FROM osm_highway   AS H   LEFT JOIN  osm_user AS U  ON   U.id_user=H.id_user  LEFT JOIN osm_date as D   ON H.id_date=D.id_date WHERE  date='2014-10-03'
