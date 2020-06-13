connector.class=io.confluent.connect.jdbc.JdbcSourceConnector
mode=incrementing
incrementing.column.name=NUMBER_DEVICE
topic.prefix=SM-
connection.password=P@$$word0
tasks.max=1
connection.user=root
connection.url=jdbc:mysql://35.185.183.115:3306/SM
table.whitelist=task_device_energy
name=Zorka-Mariadb-SM-task_device_energy-Source


connector.class=io.confluent.connect.elasticsearch.ElasticsearchSinkConnector
transforms.ConvertTime.type=org.apache.kafka.connect.transforms.TimestampConverter$Value
type.name=_doc
tasks.max=1
topics=SM-task_device_energy
transforms=ConvertTime
key.ignore=true
transforms.ConvertTime.target.type=string
schema.ignore=true
transforms.ConvertTime.field=TASK_DATETIME
topic.index.map=SM-task_device_energy:task_device_energy
transforms.ConvertTime.format=yyyy-MM-dd'T'HH:mm:ss.SS'Z'
connection.url=http://35.187.230.131:20002
name=Zorka-Elasticsearch-SM-task_device_energy-Sink




connector.class=io.confluent.connect.jdbc.JdbcSourceConnector
timestamp.column.name=DATE_TIME
incrementing.column.name=DEVICE_ID
connection.password=P@$$word0
transforms.transformKey.type=org.apache.kafka.connect.transforms.ValueToKey
tasks.max=1
transforms=transformKey
table.whitelist=dashborad_task_energy
mode=timestamp
topic.prefix=SM-
transforms.transformKey.fields=DEVICE_ID
connection.user=root
connection.url=jdbc:mysql://35.185.183.115:3306/SM
value.converter=org.apache.kafka.connect.json.JsonConverter
key.converter=org.apache.kafka.connect.json.JsonConverter
name=Zorka-Mariadb-SM-1-dashborad_task_energy-Source


connector.class=io.confluent.connect.elasticsearch.ElasticsearchSinkConnector
type.name=_doc
transforms.ConvertTime.type=org.apache.kafka.connect.transforms.TimestampConverter$Value
tasks.max=1
topics=SM-1-dashborad_task_energy
transforms=ExtractId, ConvertTime
compact.map.entries=true
key.ignore=false
transforms.ExtractId.field=DEVICE_ID
transforms.ConvertTime.target.type=string
schema.ignore=true
transforms.ConvertTime.field=DATE_TIME
topic.index.map=SM-1-dashborad_task_energy:dashborad_task_energy
transforms.ConvertTime.format=yyyy-MM-dd'T'HH:mm:ss'Z'
value.converter=org.apache.kafka.connect.json.JsonConverter
name=Zorka-Elasticsearch-SM-3-dashboard_task_energy-Sink
connection.url=http://35.187.230.131:20002
key.converter=org.apache.kafka.connect.json.JsonConverter
transforms.ExtractId.type=org.apache.kafka.connect.transforms.ExtractField$Key


connector.class=io.confluent.connect.elasticsearch.ElasticsearchSinkConnector
type.name=_doc
transforms.ConvertTime.type=org.apache.kafka.connect.transforms.TimestampConverter$Value
tasks.max=1
topics=SM-table_device_energy
transforms=ExtractId, ConvertTime
compact.map.entries=true
key.ignore=false
transforms.ExtractId.field=NUMBER_DEVICE
transforms.ConvertTime.target.type=string
schema.ignore=true
transforms.ConvertTime.field=UpdateOn
topic.index.map=SM-table_device_energy:table_device_energy
transforms.ConvertTime.format=yyyy-MM-dd'T'HH:mm:ss'Z'
value.converter=org.apache.kafka.connect.json.JsonConverter
connection.url=http://35.187.230.131:20002
key.converter=org.apache.kafka.connect.json.JsonConverter
transforms.ExtractId.type=org.apache.kafka.connect.transforms.ExtractField$Key
name=Zorka-Elasticsearch-SM-table_device_energy-Sink




connector.class=io.confluent.connect.jdbc.JdbcSourceConnector
timestamp.column.name=DATE_TIME
incrementing.column.name=DEVICE_ID
connection.password=P@$$word0
transforms.transformKey.type=org.apache.kafka.connect.transforms.ValueToKey
tasks.max=1
transforms=transformKey
table.whitelist=dashborad_task_energy
mode=timestamp
topic.prefix=SM-
transforms.transformKey.fields=DEVICE_ID
connection.user=root
connection.url=jdbc:mysql://35.185.183.115:3306/SM
value.converter=org.apache.kafka.connect.json.JsonConverter
key.converter=org.apache.kafka.connect.json.JsonConverter