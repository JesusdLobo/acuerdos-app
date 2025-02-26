import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const AGENTS_URL = 'http://75.119.141.207:8011/api/Acuerdos/AgenteComercial';
const ACUERDOS_URL = 'http://75.119.141.207:8011/api/Acuerdos';

function AcuerdoModal({ show, onHide, acuerdo }) {
  const isEdit = Boolean(acuerdo);

  const [formData, setFormData] = useState({
    idAgente: '',
    fechaAlta: '',
    fechaBaja: '',
    ambito: '',
    duracionMeses: '',
    prorrogaAutomatica: false,
    exclusividad: 0,
    codFormaPago: ''
  });

  const [agents, setAgents] = useState([]);

  const fetchAgents = async () => {
    try {
      const resp = await axios.get(AGENTS_URL);
      setAgents(resp.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  };

  useEffect(() => {
    if (show) {
      fetchAgents();
    }
  }, [show]);


  useEffect(() => {
    if (acuerdo) {
      setFormData({
        idAgente: acuerdo.idAgente || '',
        fechaAlta: acuerdo.fechaAlta ? acuerdo.fechaAlta.slice(0, 10) : '',
        fechaBaja: acuerdo.fechaBaja ? acuerdo.fechaBaja.slice(0, 10) : '',
        ambito: acuerdo.ambito || '',
        duracionMeses: acuerdo.duracionMeses || '',
        prorrogaAutomatica: acuerdo.prorrogaAutomatica || false,
        exclusividad: acuerdo.exclusividad || 0,
        codFormaPago: acuerdo.codFormaPago || ''
      });
    } else {
    
      setFormData({
        idAgente: '',
        fechaAlta: '',
        fechaBaja: '',
        ambito: '',
        duracionMeses: '',
        prorrogaAutomatica: false,
        exclusividad: 0,
        codFormaPago: ''
      });
    }
  }, [acuerdo]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

 
  const handleSubmit = async () => {
    try {

      let payload;
      if (isEdit) {
        payload = { ...acuerdo, ...formData };
      } else {
        
        payload = { ...formData };
      }

    
      if (!payload.fechaBaja) {
        payload.fechaBaja = null;
      }
     
      if (!payload.fechaAlta) {
        payload.fechaAlta = null;
      }

      if (isEdit) {
       
        await axios.put(`${ACUERDOS_URL}/${acuerdo.idAcuerdo}`, payload);
        Swal.fire('¡Actualizado!', 'El acuerdo se ha actualizado correctamente.', 'success');
      } else {
  
        await axios.post(ACUERDOS_URL, payload);
        Swal.fire('¡Creado!', 'El acuerdo se ha creado correctamente.', 'success');
      }
      onHide(true); 
    } catch (error) {
     
      if (error.response && error.response.status === 400 && error.response.data?.errors) {
        const serverErrors = error.response.data.errors;
        let errorMsg = '';
        for (const field in serverErrors) {
          errorMsg += `${field}: ${serverErrors[field].join(', ')}\n`;
        }
        Swal.fire('Error de validación', errorMsg, 'error');
      } else {
        console.error('Error guardando el acuerdo:', error);
        Swal.fire('Error', 'No se pudo guardar el acuerdo.', 'error');
      }
    }
  };

  const handleClose = () => {
    onHide(false);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Editar Acuerdo' : 'Crear Acuerdo'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Combo de agentes */}
          <Form.Group controlId="formIdAgente" className="mb-3">
            <Form.Label>Agente Comercial</Form.Label>
            <Form.Select
              name="idAgente"
              value={formData.idAgente}
              onChange={handleChange}
            >
              <option value="">-- Seleccione un agente --</option>
              {agents.map((agent) => (
                <option key={agent.idAgente} value={agent.idAgente}>
                  {agent.nombre.trim()} ({agent.nif.trim()})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="formFechaAlta" className="mb-3">
            <Form.Label>Fecha Alta</Form.Label>
            <Form.Control
              type="date"
              name="fechaAlta"
              value={formData.fechaAlta || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formFechaBaja" className="mb-3">
            <Form.Label>Fecha Baja</Form.Label>
            <Form.Control
              type="date"
              name="fechaBaja"
              value={formData.fechaBaja || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formAmbito" className="mb-3">
            <Form.Label>Ámbito</Form.Label>
            <Form.Control
              type="text"
              name="ambito"
              value={formData.ambito}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formDuracionMeses" className="mb-3">
            <Form.Label>Duración Meses</Form.Label>
            <Form.Control
              type="number"
              name="duracionMeses"
              value={formData.duracionMeses}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formProrroga" className="mb-3">
            <Form.Check
              type="checkbox"
              label="Prórroga Automática"
              name="prorrogaAutomatica"
              checked={formData.prorrogaAutomatica}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formExclusividad" className="mb-3">
            <Form.Label>Exclusividad</Form.Label>
            <Form.Control
              type="number"
              name="exclusividad"
              value={formData.exclusividad}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formCodFormaPago" className="mb-3">
            <Form.Label>Código Forma de Pago</Form.Label>
            <Form.Control
              type="text"
              name="codFormaPago"
              value={formData.codFormaPago}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AcuerdoModal;
