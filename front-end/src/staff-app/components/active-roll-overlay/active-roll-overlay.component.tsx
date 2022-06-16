import React, { useEffect, useState } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/Button"
import { BorderRadius, Spacing } from "shared/styles/styles"
import { RollStateList } from "staff-app/components/roll-state/roll-state-list.component"
import { useStudents } from "shared/contexts/student-context"
import { RolllStateType, RollInput } from "shared/models/roll"
import { useApi } from "shared/hooks/use-api"

export type ActiveRollAction = "filter" | "exit"
interface Props {
  isActive: boolean
  onItemClick: (action: ActiveRollAction, value?: RolllStateType | "all") => void
}

export const ActiveRollOverlay: React.FC<Props> = (props) => {
  const { isActive, onItemClick } = props
  const { students } = useStudents()
  const [saveRoll, data, loadState] = useApi<{ data: any }>({ url: "save-roll" })
  const [studentState, setStudentState] = useState<RollInput>()

  useEffect(() => {
    void saveRoll(studentState)
  }, [saveRoll, studentState])
  useEffect(() => {
    if (data) {
      onItemClick("exit")
    }
  }, [loadState])

  const getCount = (roll: RolllStateType) => {
    return students.filter((s) => s.role_state === roll).length
  }

  const handleSave = async () => {
    const student_roll_states = students.map((s) => {
      return { student_id: s.id, roll_state: s.role_state ? s.role_state : "unmark" }
    })
    setStudentState({ student_roll_states } as RollInput)
  }

  return (
    <S.Overlay isActive={isActive}>
      <S.Content>
        <div>Class Attendance</div>
        <div>
          <RollStateList
            stateList={[
              { type: "all", count: students.length },
              { type: "present", count: getCount("present") },
              { type: "late", count: getCount("late") },
              { type: "absent", count: getCount("absent") },
            ]}
            onItemClick={(type) => onItemClick("filter", type)}
          />
          <div style={{ marginTop: Spacing.u6 }}>
            <Button color="inherit" onClick={() => onItemClick("exit")}>
              Exit
            </Button>
            <Button color="inherit" style={{ marginLeft: Spacing.u2 }} onClick={handleSave}>
              Complete
            </Button>
          </div>
        </div>
      </S.Content>
    </S.Overlay>
  )
}

const S = {
  Overlay: styled.div<{ isActive: boolean }>`
    position: fixed;
    bottom: 0;
    left: 0;
    height: ${({ isActive }) => (isActive ? "120px" : 0)};
    width: 100%;
    background-color: rgba(34, 43, 74, 0.92);
    backdrop-filter: blur(2px);
    color: #fff;
  `,
  Content: styled.div`
    display: flex;
    justify-content: space-between;
    width: 52%;
    height: 100px;
    margin: ${Spacing.u3} auto 0;
    border: 1px solid #f5f5f536;
    border-radius: ${BorderRadius.default};
    padding: ${Spacing.u4};
  `,
}
