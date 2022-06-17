import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { useApi } from "shared/hooks/use-api"
import { ActivityTable } from "../components/table/activity-table.component"
import { Activity } from "../../shared/models/activity"

export const ActivityPage: React.FC = () => {
  const [getActivities, data, loadState] = useApi<{ activity: Activity[] }>({ url: "get-activities" })
  const [attendenceData, setAttendeceData] = useState<Activity[]>([])
  useEffect(() => {
    void getActivities()
  }, [getActivities])
  useEffect(() => {
    if (loadState == "loaded" && data) {
      setAttendeceData(data.activity)
    }
  }, [loadState])
  return (
    <S.Container>
      <ActivityTable attendenceData={attendenceData} loading={loadState} />
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 70%;
    align-items: center;
    justify-content: center;
    margin: 10vh auto;
  `,
}
