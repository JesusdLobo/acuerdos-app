import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const BASE_URL = 'https://nortalia.eu/api';

function TarifasModal({ show, onHide, acuerdo }) {
  const [assignedTarifas, setAssignedTarifas] = useState([]);
  const [allTarifas, setAllTarifas] = useState([]);
  const [filterNameAvail, setFilterNameAvail] = useState('');
  const [filterNameAssigned, setFilterNameAssigned] = useState('');

  const fetchAssignedTarifas = useCallback(async () => {
    if (!acuerdo) return;
    try {
      const resp = await axios.get(`${BASE_URL}/Acuerdos/${acuerdo.idAcuerdo}/tarifas`);
      setAssignedTarifas(resp.data || []);
    } catch {
      setAssignedTarifas([]);
    }
  }, [acuerdo]);

  const fetchAllTarifas = useCallback(async () => {
    try {
      const resp = await axios.get(`${BASE_URL}/Acuerdos/tarifas`);
      setAllTarifas(resp.data || []);
    } catch {
      setAllTarifas([]);
    }
  }, []);

  useEffect(() => {
    if (show && acuerdo) {
      fetchAssignedTarifas();
      fetchAllTarifas();
      setFilterNameAvail('');
      setFilterNameAssigned('');
    }
  }, [show, acuerdo, fetchAssignedTarifas, fetchAllTarifas]);

  const filteredTarifasDisponibles = allTarifas.filter((tarifa) =>
    tarifa.nombre.toLowerCase().includes(filterNameAvail.toLowerCase())
  );

  const filteredTarifasAsignadas = assignedTarifas.filter((t) =>
    t.nombre.toLowerCase().includes(filterNameAssigned.toLowerCase())
  );

  const isTarifaAssigned = (tarifaId) => {
    return assignedTarifas.some((t) => t.idTarifa === tarifaId);
  };

  const handleTarifaCheck = (tarifa, checked) => {
    if (!acuerdo) return;
    if (checked) {
      setAssignedTarifas((p) => [
        ...p,
        {
          idTarifaAcuerdo: 0,
          idAcuerdo: acuerdo.idAcuerdo,
          idTarifa: tarifa.idTarifa,
          porcRenovacion: 0,
          fechaVigor: new Date().toISOString(),
          nombre: tarifa.nombre,
          inicioVigencia: tarifa.inicioVigencia,
          finVigencia: tarifa.finVigencia
        }
      ]);
    } else {
      setAssignedTarifas((p) => p.filter((x) => x.idTarifa !== tarifa.idTarifa));
    }
  };

  const handleRemoveAssigned = (tarifaId) => {
    setAssignedTarifas((p) => p.filter((x) => x.idTarifa !== tarifaId));
  };

  const handleSave = async () => {
    if (!acuerdo) return;
    if (assignedTarifas.length < 20) {
      Swal.fire('Error', 'Debes asignar al menos 20 tarifas a este acuerdo.', 'error');
      return;
    }
    const payload = assignedTarifas.map((t) => ({
      idTarifaAcuerdo: t.idTarifaAcuerdo || 0,
      idAcuerdo: t.idAcuerdo,
      idTarifa: t.idTarifa,
      porcRenovacion: t.porcRenovacion || 0,
      fechaVigor: t.fechaVigor || new Date().toISOString()
    }));
    try {
      await axios.put(`${BASE_URL}/Acuerdos/${acuerdo.idAcuerdo}/tarifas`, payload);
      Swal.fire('¡Guardado!', 'Las tarifas se han asignado correctamente.', 'success');
      onHide(true);
    } catch {
      Swal.fire('Error', 'No se pudo actualizar la asignación de tarifas.', 'error');
    }
  };

  const handleClose = () => {
    onHide(false);
  };

  if (!acuerdo) return null;

  const cliente = acuerdo.agenteComercial?.nombre?.trim() || 'Sin Cliente';
  const headerTitle = `Tarifas del Acuerdo #${acuerdo.idAcuerdo} - Cliente: ${cliente}`;

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: '1.2rem' }}>{headerTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Selecciona las tarifas a asignar a este acuerdo (mínimo 20).</p>
        <div className="row">
          <div className="col-6">
            <h5>Tarifas Disponibles</h5>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                placeholder="Filtrar por nombre..."
                value={filterNameAvail}
                onChange={(e) => setFilterNameAvail(e.target.value)}
              />
            </Form.Group>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <Table size="sm" bordered hover responsive className="my-table">
                <thead>
                  <tr>
                    <th style={{ width: '2rem' }}></th>
                    <th>Nombre</th>
                    <th>Inicio Vigencia</th>
                    <th>Fin Vigencia</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTarifasDisponibles.map((tarifa) => {
                    const checked = isTarifaAssigned(tarifa.idTarifa);
                    return (
                      <tr key={tarifa.idTarifa}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => handleTarifaCheck(tarifa, e.target.checked)}
                          />
                        </td>
                        <td>{tarifa.nombre}</td>
                        <td>
                          {tarifa.inicioVigencia
                            ? new Date(tarifa.inicioVigencia).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>
                          {tarifa.finVigencia
                            ? new Date(tarifa.finVigencia).toLocaleDateString()
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>
          <div className="col-6">
            <h5>Tarifas Asignadas: {assignedTarifas.length}</h5>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                placeholder="Filtrar por nombre..."
                value={filterNameAssigned}
                onChange={(e) => setFilterNameAssigned(e.target.value)}
              />
            </Form.Group>
            <Table size="sm" bordered hover responsive className="my-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th style={{ width: '2rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredTarifasAsignadas.map((t) => (
                  <tr key={t.idTarifa}>
                    <td>{t.nombre}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveAssigned(t.idTarifa)}
                      >
                        X
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TarifasModal;