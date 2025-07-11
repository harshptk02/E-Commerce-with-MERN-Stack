import AdminSidebar from './AdminSidebar'
import { createContext, useContext, useState } from 'react'

export const SidebarContext = createContext()

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className="flex">
        <AdminSidebar />
        <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-[250px]' : 'ml-[100px]'}`}>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

export default AdminLayout 