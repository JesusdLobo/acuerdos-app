import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Card,
  Table,
  Button,
  ButtonGroup,
  Form,
  Row,
  Col
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaDollarSign } from 'react-icons/fa';

import AcuerdoModal from './AcuerdoModal';
import TarifasModal from './TarifasModal';

const BASE_URL = 'http://75.119.141.207:8011/api'; 

function AcuerdosPage() {
  const [acuerdos, setAcuerdos] = useState([]);
  const [agentes, setAgentes] = useState([]); // Lista de agentes desde la API

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filterAgent, setFilterAgent] = useState('Todos');
  const [filterNif, setFilterNif] = useState('');

  const [showAcuerdoModal, setShowAcuerdoModal] = useState(false);
  const [showTarifasModal, setShowTarifasModal] = useState(false);
  const [selectedAcuerdo, setSelectedAcuerdo] = useState(null);

  // --- Cargar acuerdos ---
  const fetchAcuerdos = async () => {
    try {
      const resp = await axios.get(`${BASE_URL}/Acuerdos?page=${page}&pageSize=${pageSize}`);
      setAcuerdos(resp.data.data || []);
      setTotalPages(resp.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching acuerdos:', error);
      setAcuerdos([]);
    }
  };

  const fetchAgentes = async () => {
    try {
      const resp = await axios.get(`${BASE_URL}/Acuerdos/AgenteComercial`);
      setAgentes(resp.data || []);
    } catch (error) {
      console.error('Error fetching agentes:', error);
      setAgentes([]);
    }
  };

  useEffect(() => {
    fetchAcuerdos();
    fetchAgentes();
  }, [page]);

  const handleDelete = (acuerdoId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminará este acuerdo de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/Acuerdos/${acuerdoId}`);
          Swal.fire('¡Eliminado!', 'El acuerdo ha sido eliminado.', 'success');
          fetchAcuerdos();
        } catch (error) {
          console.error('Error deleting acuerdo:', error);
          Swal.fire('Error', 'No se pudo eliminar el acuerdo.', 'error');
        }
      }
    });
  };

  const handleCreate = () => {
    setSelectedAcuerdo(null);
    setShowAcuerdoModal(true);
  };

  const handleEdit = (ac) => {
    setSelectedAcuerdo(ac);
    setShowAcuerdoModal(true);
  };

  const handleManageTarifas = (ac) => {
    setSelectedAcuerdo(ac);
    setShowTarifasModal(true);
  };

  const closeAcuerdoModal = (refresh) => {
    setShowAcuerdoModal(false);
    if (refresh) fetchAcuerdos();
  };

  const closeTarifasModal = (refresh) => {
    setShowTarifasModal(false);
    if (refresh) fetchAcuerdos();
  };


  const filteredAcuerdos = acuerdos.filter((ac) => {
    if (filterAgent !== 'Todos') {
      const agenteId = ac.agenteComercial ? ac.agenteComercial.idAgente : '';
      if (parseInt(filterAgent) !== agenteId) return false;
    }
    if (filterNif.trim() !== '') {
      const nif = ac.agenteComercial ? ac.agenteComercial.nif.trim() : '';
      if (!nif.includes(filterNif.trim())) return false;
    }
    return true;
  });

  return (
    <Card className="shadow">
      <Card.Body>
        {/* Filtros y botón de nuevo */}
        <Row className="mb-3">
          <Col md="8" className="d-flex gap-2 align-items-center">
            <Form.Select
              style={{ maxWidth: '250px' }}
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
            >
              <option value="Todos">Todos los agentes</option>
              {agentes.map((agente) => (
                <option key={agente.idAgente} value={agente.idAgente}>
                  {agente.nombre.trim()} ({agente.nif.trim()})
                </option>
              ))}
            </Form.Select>

            <Form.Control
              type="text"
              placeholder="Buscar por NIF"
              style={{ maxWidth: '200px' }}
              value={filterNif}
              onChange={(e) => setFilterNif(e.target.value)}
            />
          </Col>
          <Col md="4" className="text-end">
            <Button
              style={{
                backgroundColor: '#45FFAF',
                border: 'none',
                color: '#172632'
              }}
              onClick={handleCreate}
            >
              <FaPlus /> Crear Acuerdo
            </Button>
          </Col>
        </Row>

        {/* Tabla de Acuerdos */}
        <Table bordered hover responsive className="my-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>NIF</th>
              <th>FechaAlta</th>
              <th>Ámbito</th>
              <th>DuraciónMeses</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAcuerdos.map((ac) => {
              const agente = ac.agenteComercial ? ac.agenteComercial.nombre.trim() : 'Sin Agente';
              const nif = ac.agenteComercial ? ac.agenteComercial.nif.trim() : '';
              return (
                <tr key={ac.idAcuerdo}>
                  <td>{agente}</td>
                  <td>{nif}</td>
                  <td>{ac.fechaAlta ? new Date(ac.fechaAlta).toLocaleDateString() : '-'}</td>
                  <td>{ac.ambito ? ac.ambito.trim() : '-'}</td>
                  <td>{ac.duracionMeses || '-'}</td>
                  <td className="text-center">
                    <ButtonGroup>
                      <Button variant="info" size="sm" onClick={() => handleEdit(ac)}>
                        <FaEdit /> Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(ac.idAcuerdo)}>
                        <FaTrash /> Eliminar
                      </Button>
                      <Button variant="warning" size="sm" onClick={() => handleManageTarifas(ac)}>
                        <FaDollarSign /> Tarifas
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {/* Paginación */}
        <div className="d-flex justify-content-between mt-3">
          <span>Página {page} de {totalPages}</span>
          <div>
            <Button variant="outline-secondary" className="me-2" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Anterior
            </Button>
            <Button variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      </Card.Body>

      {/* Modales */}
      {showAcuerdoModal && <AcuerdoModal show={showAcuerdoModal} onHide={closeAcuerdoModal} acuerdo={selectedAcuerdo} />}
      {showTarifasModal && <TarifasModal show={showTarifasModal} onHide={closeTarifasModal} acuerdo={selectedAcuerdo} />}
    </Card>
  );
}

export default AcuerdosPage;
