import React, { useState, useEffect, useContext } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { useStudents } from "shared/contexts/student-context"
import { RolllStateType } from "shared/models/roll"
import { TextField, Select, MenuItem, FormControl } from "@material-ui/core"
import { PersonHelper } from "shared/models/person"
import styles from "./home-board-page.module.scss"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const { students, setStudents } = useStudents()
  const [isFiltering, setIsFiltering] = useState<Boolean>(false)
  const [filterType, setFilterType] = useState<ItemType>()
  const [sortOrder, setSortOrder] = useState<string>("")
  const [sortCriteria, setSortCriteria] = useState<string>("first_name")
  const [searchText, setSearchText] = useState<string>("")

  useEffect(() => {
    if (data) setStudents(data.students)
  }, [loadState])

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  const changeSortCriteria = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortCriteria(event.target.value as string)
  }
  const isSearchCriteriaSuccess = (student: Person) => {
    if (!searchText) return true
    return PersonHelper.getFullName(student).toLowerCase().match(searchText.toLowerCase())
  }
  const handleChangeSearchText = (event: React.ChangeEvent<{ value: unknown }>) => {
    const searchString = event.target.value as string
    setSearchText(searchString)
  }

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
      return
    }
    students.sort((a: Person | any, b: Person) => {
      if (sortCriteria == "first_name") {
        return sortOrder === "asc" ? b.first_name.localeCompare(a.first_name) : a.first_name.localeCompare(b.first_name)
      }
      return sortOrder === "asc" ? b.last_name.localeCompare(a.last_name) : a.last_name.localeCompare(b.last_name)
    })
    sortOrder === "asc" ? setSortOrder("desc") : setSortOrder("asc")
  }

  const onActiveRollAction = (action: ActiveRollAction, type?: ItemType) => {
    if (action === "exit") {
      setIsRollMode(false)
      setIsFiltering(false)
    } else if (type == "all") {
      setIsFiltering(false)
    } else {
      setFilterType(type)
      setIsFiltering(true)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar
          onItemClick={onToolbarAction}
          sortOrder={sortOrder}
          sortCriteria={sortCriteria}
          handleChangeCriteria={changeSortCriteria}
          handleChangeSearchText={handleChangeSearchText}
        />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && students && (
          <>
            {students.map((s) => {
              if ((isFiltering && s.role_state == filterType && isSearchCriteriaSuccess(s)) || (!isFiltering && isSearchCriteriaSuccess(s)))
                return <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            })}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}
type ItemType = RolllStateType | "all"
type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  sortOrder: String
  sortCriteria: String
  handleChangeCriteria: (event: React.ChangeEvent<{ value: unknown }>) => void
  handleChangeSearchText: (event: React.ChangeEvent<{ value: unknown }>) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { sortCriteria, sortOrder, onItemClick, handleChangeCriteria, handleChangeSearchText } = props
  return (
    <S.ToolbarContainer>
      <div className={styles.toolbar__item_wrapper}>
        <FormControl variant="outlined" className={styles.toolbar__formControl}>
          <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={sortCriteria}
            onChange={handleChangeCriteria}
            className={styles.toolbar__select}
          >
            <MenuItem value={"first_name"}>First Name</MenuItem>
            <MenuItem value={"last_name"}>Last Name</MenuItem>
          </Select>
        </FormControl>
        <FontAwesomeIcon
          icon={sortOrder === "desc" ? "sort-alpha-up" : "sort-alpha-down"}
          onClick={() => onItemClick("sort")}
          className={sortOrder == "" ? styles.toolbar__sort_disabled : styles.toolbar__sort_enabled}
        />
      </div>
      <div>
        {" "}
        <TextField id="outlined-basic" variant="outlined" placeholder="Search" className={styles.toolbar__search} onChange={handleChangeSearchText} />
      </div>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}
