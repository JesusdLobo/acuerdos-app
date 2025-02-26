import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import Swal from 'sweetalert2';
import AcuerdosPage from './components/AcuerdosPage';

function App() {

  const handleSalir = () => {
    Swal.fire({
      title: '¿Desea cerrar la pestaña?',
      text: 'No podrá continuar con la aplicación.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',   
      cancelButtonColor: '#3085d6', 
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
 
        window.close();
      }
    });
  };

  return (
    <>
      
      <Navbar style={{ backgroundColor: '#172632' }} variant="dark" expand="lg">
        <Container>
        
          <Navbar.Brand href="#">
            <img
              src="https://proximaenergia.com/wp-content/uploads/2023/10/Brand-Book-Proxima-6-600x255-1.png"
              alt="Próxima Energía"
              style={{ height: '50px' }}
            />
          </Navbar.Brand>
          <Nav className="ms-auto">
        
            <Nav.Link style={{ color: '#fff' }} onClick={handleSalir}>
              Salir
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>


      <Container className="my-4">
        <h1 className="text-center mb-4" style={{ color: '#172632' }}>
          Gestión de Acuerdos Comerciales
        </h1>
        <AcuerdosPage />
      </Container>
    </>
  );
}

export default App;
