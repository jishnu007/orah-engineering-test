import {
  Box,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@material-ui/core"
import React, { useState } from "react"
import { Roll } from "shared/models/roll"
import { Activity } from "../../../shared/models/activity"
import Styles from "./activity-table.module.scss"

interface Props {
  attendenceData: Activity[]
  loading: string
}
interface HeadCell {
  disablePadding: boolean
  id: keyof any
  label: string
  numeric: boolean
}
type Order = "asc" | "desc"

export const ActivityTable: React.FC<Props> = ({ attendenceData, loading }) => {
  const createData = (date: Date, name: string, present: number, late: number, absent: number, unmark: number) => {
    return {
      date,
      name,
      present,
      late,
      absent,
      unmark,
    }
  }
  const tableData = attendenceData.map((e) => {
    const date = e.date
    const name = e.entity.name
    const present = e.entity.student_roll_states.filter((f) => f.roll_state === "present").length
    const late = e.entity.student_roll_states.filter((f) => f.roll_state === "late").length
    const absent = e.entity.student_roll_states.filter((f) => f.roll_state === "absent").length
    const unmark = e.entity.student_roll_states.filter((f) => f.roll_state === "unmark").length
    return createData(date, name, present, late, absent, unmark)
  })

  const headCells: readonly HeadCell[] = [
    {
      id: "date",
      numeric: false,
      disablePadding: true,
      label: "Date",
    },
    {
      id: "name",
      numeric: false,
      disablePadding: true,
      label: "Name",
    },
    {
      id: "present",
      numeric: true,
      disablePadding: true,
      label: "Present",
    },
    {
      id: "late",
      numeric: true,
      disablePadding: true,
      label: "Late",
    },
    {
      id: "abscent",
      numeric: true,
      disablePadding: true,
      label: "Absent",
    },
    {
      id: "unmark",
      numeric: true,
      disablePadding: true,
      label: "Unmark",
    },
  ]

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  // Sorting
  const [order, setOrder] = useState<Order>("desc")
  const [orderBy, setOrderBy] = useState<string>("date")
  const createSortHandler = (property: any) => (event: any) => {
    handleRequestSort(event, property)
  }
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof any) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property as string)
  }

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1
    }
    if (b[orderBy] > a[orderBy]) {
      return 1
    }
    return 0
  }

  function getComparator<Key extends keyof any>(order: Order, orderBy: Key): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === "desc" ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy)
  }

  return (
    <TableContainer component={Paper} className={Styles.activityTable}>
      {loading == "loading" && <LinearProgress />}
      <Table>
        <TableHead className={Styles.activityTable__head}>
          <TableRow>
            {headCells.map((headCell) => (
              <TableCell key={headCell.id as string} align="left" sortDirection={orderBy === headCell.id ? order : false}>
                <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : "asc"} onClick={createSortHandler(headCell.id)}>
                  {headCell.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData
            .sort(getComparator(order, orderBy) as any)
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((item, index) => {
              return (
                <TableRow key={index} className={Styles.activityTable__row}>
                  <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.present}</TableCell>
                  <TableCell>{item.late}</TableCell>
                  <TableCell>{item.absent}</TableCell>
                  <TableCell>{item.unmark}</TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
      <TableFooter className={Styles.activityTable__footer} component="div">
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={attendenceData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </TableFooter>
    </TableContainer>
  )
}
