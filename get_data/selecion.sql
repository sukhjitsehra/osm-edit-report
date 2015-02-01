--selecion
SELECT iduser, osmuser, color, estado FROM osm_user where estado=true
SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,6,6) as osmd, sum(o.node_v1 + o.node_vx) as node , sum(o.way_v1 + o.way_vx) as way, sum(o.relation_v1+ o.relation_vx) as relation
FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser  WHERE osmdate> 1412139600 AND osmdate<1417582800 AND u.estado=true  GROUP BY osmd,u.osmuser ORDER BY osmd;
SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,8,14) as osmd, (o.node_v1 + o.node_vx) as node , (o.way_v1 + o.way_vx) as way, (o.relation_v1+ o.relation_vx) as relation
FROM osm_obj as o  INNER JOIN osm_user as u on  u.iduser =  o.iduser WHERE o.osmdate>=1412226000 AND o.osmdate<1412571600 AND u.estado=true
DELETE FROM osm_obj  WHERE iduser = 2226712  AND osmdate < 1406851200
SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,0,5) as osmd, sum(o.node_v1 + o.node_vx) as node , sum(o.way_v1 + o.way_vx) as way, sum(o.relation_v1+ o.relation_vx) as relation
FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser  WHERE osmdate>= 1357016400 AND osmdate<1420088400 AND u.estado=true  GROUP BY osmd,u.osmuser ORDER BY osmd