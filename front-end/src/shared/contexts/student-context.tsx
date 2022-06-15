import React from "react"
import { createContext, Dispatch, SetStateAction, useState, useContext } from "react"
import { Person } from "shared/models/person"

export type StudentContextType = {
  students: Person[]
  setStudents: (persons: Person[]) => void
}

const StudentContext = createContext<StudentContextType>({} as StudentContextType)

const StudentContextProvider: React.FC = ({ children }) => {
  const [students, setStudents] = useState<Person[]>([])
  return <StudentContext.Provider value={{ students, setStudents }}>{children}</StudentContext.Provider>
}
export default StudentContextProvider

export const useStudents = () => useContext(StudentContext)
