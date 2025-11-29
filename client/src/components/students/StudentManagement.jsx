import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import axios from 'axios';

import UpdateStudent from './UpdateStudent';
import AddStudent from './AddStudent';

const API_BASE = 'http://localhost:1235/api/student';

const StudentManagement = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [activeComponent, setActiveComponent] = useState('');
  const [student, setStudent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = useSelector(state => state.user.token);
  const toast = useRef(null);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/getAllStudents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = data.slice().sort((a, b) => a.name.localeCompare(b.name));
      setAllStudents(sorted);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const deleteStudent = async () => {
    try {
      await axios.delete(`${API_BASE}/deleteStudent/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStudents();
      toast.current.show({
        severity: 'error',
        summary: 'Deleted',
        detail: 'Student deleted successfully',
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: 'warn',
        summary: 'Error',
        detail: 'Could not delete student',
        life: 3000,
      });
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const toggleActiveStatus = async (id) => {
    try {
      await axios.put(`${API_BASE}/changeActive/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStudents();
      toast.current.show({
        severity: 'success',
        summary: 'Status Changed',
        detail: 'Student status updated',
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: 'warn',
        summary: 'Error',
        detail: 'Could not change status',
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const purpleColor = '#542468';
  const buttonStyle = {
    backgroundColor: purpleColor,
    borderColor: purpleColor,
    color: '#FFFFFF',
  };

  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      <span className="text-xl text-900 font-bold" style={{ color: purpleColor }}>
        Students
      </span>
    </div>
  );

  const footer = `In total there are ${allStudents.length} students.`;

  if (activeComponent === 'update') {
    return (
      <UpdateStudent
        fetchStudents={fetchStudents}
        student={student}
        setActiveComponent={setActiveComponent}
        toast={toast}
      />
    );
  }

  if (activeComponent === 'add') {
    return <AddStudent fetchStudents={fetchStudents} setActiveComponent={setActiveComponent} toast={toast} />;
  }

  return (
    <div className="card" style={{ backgroundColor: '#F4F4F4' ,textAlign: 'center'}}>
   
      <Toast ref={toast} />
      <ConfirmDialog
        visible={showConfirm}
        onHide={() => setShowConfirm(false)}
        message="Are you sure you want to delete this student?"
        header="Delete Confirmation"
        icon={null}
        acceptClassName="p-button-danger"
        rejectClassName="p-button-success"
        accept={deleteStudent}
        reject={() => setShowConfirm(false)}
      />
      <DataTable
        value={allStudents}
        header={header}
        footer={footer}
        tableStyle={{ minWidth: '60rem' }}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <Column field="name" header="Name" />
        <Column field="idNumber" header="ID Number" />
        <Column field="classNumber" header="Class Number" />
        <Column field="parentEmail" header="Parent Email" />
        <Column
          field="active"
          header="Active"
          body={(rowData) => <span>{rowData.active ? 'Yes' : 'No'}</span>}
        />
        <Column
          body={(rowData) => (
            <div className="flex align-items-center gap-2">
              <Button
                onClick={() => toggleActiveStatus(rowData._id)}
                icon="pi pi-user-edit"
                className="p-button-rounded"
                style={buttonStyle}
                tooltip={rowData.active ? 'Deactivate' : 'Activate'}
              />
              <Button
                onClick={() => confirmDelete(rowData._id)}
                icon="pi pi-trash"
                className="p-button-rounded"
                style={buttonStyle}
                tooltip="Delete"
              />
              <Button
                onClick={() => {
                  setStudent(rowData);
                  setActiveComponent('update');
                }}
                icon="pi pi-pencil"
                className="p-button-rounded"
                style={buttonStyle}
                tooltip="Edit"
              />
            </div>
          )}
        />
      </DataTable>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          style={{ ...buttonStyle, marginBottom: '5px' }}
          onClick={() => setActiveComponent('add')}
          icon="pi pi-plus"
          className="p-button-rounded"
        >
          Add Student
        </Button>
      </div>
    </div>
  );
};

export default StudentManagement;