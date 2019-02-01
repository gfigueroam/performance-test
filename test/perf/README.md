
### Performance Testing Service (UDS)

# Current Total Number of Users : 82

Workload Distribution in TPS (Transactions Per Second)


|Jira| API | TPS | % distribution |
| ------ | ------ | ------ | ------ |
|UIS-82 | data.user.query | 45 |  55 |
|UIS-130 | data.user.list | 1 | 2 |
|UIS- | data.user.set | 1 | 2 |
|UIS-130 | data.user.get | 1 | 2 |
|UIS-130 | data.user.delete | 1 | 2 |
|UIS-130 | data.cb.query | 1 | 2 |
|UIS-116 | data.cb.set | 2 | 3 |
|UIS-130 | data.cb.merge | 1 | 2 |
|UIS-89 | data.cb.get | 3 | 4 |
|UIS-87 | data.cb.increment | 10 | 13 |
|UIS-130 | data.cb.decrement | 1 | 2 |
|UIS-130 | data.cb.unset | 1 | 2 |
|UIS-115 | data.app.query | 3 | 4 |
|UIS-20 | data.app.list | 2 | 3 |
|UIS-91 | data.app.get | 3 | 4 |
|UIS-114 | data.app.set | 3 | 4 |
|UIS-123 | data.app.delete | 2 | 3 |
|UIS-130 | data.app.merge | 1 | 2 |

To update workload distribution , modify  `Workload.scala` located at `./perf/src/test/scala/com/hmhco/uds/performance/config/Workload.scala`
Workload.scala containes Map which takes % distribution of users. Example below, udsDataUserQuery will have 50% of given load.
If MaxNumberOfUsers = 120 , udsDataUserQuery scenario will be run with 60 users. This Map will help to alter  % distribution for any future requirements.

```sh
  val wl = Map(
    "udsDataFeed" -> 0,
    "udsDataUserQuery" -> 50,
    "udsDataUserSet" -> 0,
    "udsDataUserList" -> 2,
    "udsDataUserDelete" -> 0,
    "udsDataUserSetGetDelete" -> 2,
    "udsDataCbIncrement" -> 10,
    "udsDataCbDecrement" -> 2,
    "udsDataCbGet" -> 3,
    "udsDataCbSet" -> 3,
    "udsDataCbQuery" -> 1,
    "udsDataCbUnSet" -> 2,
    "udsDataCbMerge" -> 2,
    "udsDataAppQuery" -> 4,
    "udsDataAppList" -> 3,
    "udsDataAppMerge" -> 1,
    "udsDataAppSetMergeGetDelete" -> 5,
    "udsDataAppSet" -> 0,
    "udsDataAppGet" -> 0
  )
```
### Running using npm

From root directory, run
```sh
npm run perf:cert
```

### Results Location
https://jira.hmhco.com/browse/UIS-25
