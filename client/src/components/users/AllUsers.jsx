import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useSelector } from "react-redux";
import axios from '../../axiosConfig';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [globalQuery, setGlobalQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState(null); // "view" | "edit" | null
  const toast = useRef(null);
  const token = useSelector(state => state.user.token);
  const navigate = useNavigate();

  const purple = '#542468';
  const gray = '#58585a';
  const lilacBg = '#f7f3ff';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:1235/api/user/getAllUsers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load users',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete('http://localhost:1235/api/user/deleteUser', {
        headers: { Authorization: `Bearer ${token}` },
        data: { id }
      });
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: `User ${id} deleted`,
        life: 3000
      });
      fetchUsers();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to delete the staff member`,
        life: 3000
      });
    }
  };

  const handleViewUser = (rowData) => {
    setSelectedUser(rowData);
    setViewMode("view");
  };

  const handleEditUser = (rowData) => {
    setSelectedUser(rowData);
    setViewMode("edit");
  };

  const handleClose = () => {
    setSelectedUser(null);
    setViewMode(null);
  };

  const handleSaveUser = async () => {
    try {
      await axios.put('http://localhost:1235/api/user/updateUser', selectedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Updated',
        detail: `Staff Member ${selectedUser.name} Updated Successfully`,
        life: 3000
      });

      setViewMode(null);
      setSelectedUser(null);
      fetchUsers(); // ריענון
    } catch (error) {
      console.error('Error updating the staff member:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update user',
        life: 3000
      });
    }
  };

  const roleTemplate = (rowData) => (
    <span style={{
      padding: '0.25rem 0.5rem',
      borderRadius: '999px',
      backgroundColor: rowData.role === 'principal' ? '#eaf4ff' : '#f3e5f5',
      color: rowData.role === 'principal' ? '#1e88e5' : '#7b1fa2',
      fontWeight: 600,
      fontSize: '0.85rem'
    }}>
      {rowData.role === 'principal' ? 'Principal' : 'Secretary'}
    </span>
  );

  const dateTemplate = (rowData) =>
    new Date(rowData.createdAt).toLocaleDateString('he-IL');

  const actionTemplate = (rowData) => (
    <div className="flex gap-2 justify-content-end">
      <Button
        icon="pi pi-link"
        className="p-button-rounded p-button-sm"
        style={{ backgroundColor: purple, borderColor: purple }}
        onClick={() => handleViewUser(rowData)}
        tooltip="View"
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-sm p-button-secondary"
        onClick={() => handleEditUser(rowData)}
        tooltip="Edit"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-sm p-button-danger"
        onClick={() => handleDeleteUser(rowData.id)}
        tooltip="Delete"
      />
    </div>
  );

  const goBack = () => {
    navigate('/homePage');
  };

  // חיפוש קליינט-סייד כדי להציג רק את התוצאות המסוננות בטבלה/פאג׳ינציה/פוטר
  const filteredUsers = users.filter(u => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return true;
    return [
      u.name ?? '',
      String(u.id ?? ''),
      u.role ?? ''
    ].some(val => String(val).toLowerCase().includes(q));
  });

  // Header של הטבלה עם חיפוש ואקשנים
  const tableHeader = (
    <div className="flex align-items-center justify-content-between w-full" style={{ gap: '1rem', flexWrap: 'wrap' }}>
      <div className="flex align-items-center" style={{ gap: '0.5rem' }}>
        <i className="pi pi-users" style={{ color: purple, fontSize: '1.4rem' }} />
        <span style={{ color: purple, fontWeight: 700, fontSize: '1.2rem' }}>All System Staff Members</span>
      </div>

      <div className="flex align-items-center" style={{ gap: '0.5rem' }}>
        <Button
          label="Back to Home Page"
          icon="pi pi-arrow-right"
          onClick={goBack}
          className="p-button-rounded"
          style={{ backgroundColor: purple, borderColor: purple }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-4" style={{ direction: 'rtl', background: '#fff' }}>
      <Toast ref={toast} />

      {/* דיאלוג עריכה */}
      <Dialog
        header="Edit User"
        visible={viewMode === 'edit'}
        style={{ width: '32rem' }}
        onHide={handleClose}
        modal
        headerStyle={{ background: lilacBg, color: purple, fontWeight: 700 }}
      >
        {selectedUser && (
          <div className="p-fluid">
            <div className="field">
              <label htmlFor="name" style={{ color: gray, fontWeight: 600 }}>Name</label>
              <InputText
                id="name"
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="id" style={{ color: gray, fontWeight: 600 }}>ID</label>
              <InputText
                id="id"
                value={selectedUser.id}
                onChange={(e) => setSelectedUser({ ...selectedUser, id: e.target.value })}
                disabled
              />
            </div>
            <div className="flex justify-content-end gap-2 mt-4">
              <Button
                label="Cancel"
                className="p-button-secondary p-button-rounded"
                onClick={handleClose}
              />
              <Button
                label="Save"
                className="p-button-rounded"
                style={{ backgroundColor: purple, borderColor: purple }}
                onClick={handleSaveUser}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* דיאלוג צפייה */}
      <Dialog
        header="User Details"
        visible={viewMode === 'view'}
        style={{ width: '32rem' }}
        onHide={handleClose}
        modal
        headerStyle={{ background: lilacBg, color: purple, fontWeight: 700 }}
      >
        <div className="p-fluid">
          <div className="field">
            <label style={{ color: gray, fontWeight: 600 }}>Name</label>
            <InputText value={selectedUser?.name || ''} disabled />
          </div>
          <div className="field">
            <label style={{ color: gray, fontWeight: 600 }}>ID</label>
            <InputText value={selectedUser?.id || ''} disabled />
          </div>
          <div className="field">
            <label style={{ color: gray, fontWeight: 600 }}>Role</label>
            <InputText value={selectedUser?.role || ''} disabled />
          </div>
          <div className="field">
            <label style={{ color: gray, fontWeight: 600 }}>Join Date</label>
            <InputText value={selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('he-IL') : ''} disabled />
          </div>
        </div>
      </Dialog>

      <Card
        className="shadow-2"
        style={{
          borderRadius: '16px',
          maxWidth: 1200,
          margin: '0 auto',
          background: '#fff'
        }}
      >
        {tableHeader}

        <div style={{ borderRadius: 12, overflow: 'hidden', marginTop: '1rem', border: `1px solid ${lilacBg}` }}>
          <DataTable
            value={filteredUsers}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="p-datatable-gridlines"
            emptyMessage="No users found"
            style={{ direction: 'ltr' }}
            stripedRows
            tableStyle={{ minWidth: '60rem' }}
          >
            <Column field="name" header="Name" sortable />
            <Column field="id" header="ID Number" sortable />
            <Column field="role" header="Role" body={roleTemplate} sortable />
            <Column field="createdAt" header="Join Date" body={dateTemplate} sortable />
            <Column header="Actions" body={actionTemplate} style={{ textAlign: 'center', width: '10rem' }} />
          </DataTable>
        </div>

        <div className="mt-3" style={{ textAlign: 'center', color: gray }}>
          In total there are <b>{filteredUsers.length}</b> staff members.
        </div>
      </Card>
    </div>
  );
};

export default AllUsers;
