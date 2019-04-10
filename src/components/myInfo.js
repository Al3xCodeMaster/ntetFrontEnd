import React, { Component } from 'react'
import '../App.css';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import { connect } from 'react-redux'
import showInfoAction from '../redux/actions/showInfoAction'
import isAuthenticated from '../redux/actions/isAuthenticated'
import isLogOut from '../redux/actions/isLogOut'
import axios from 'axios'

class myInfo extends React.Component {


  constructor(props, context) {
    super(props, context);
    this.handleClose = this.handleClose.bind(this);
    this.handlerChange = this.handlerChange.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.onChanged = this.onChanged.bind(this);
    this.pagar = this.pagar.bind(this);
    this.state = {
      textNombre: '',
      textApellido: '',
      modif: false,
      numText: '',
      passText: '',
      showDelete: false  
    }
  }


  pagar(){
    const {showInfo} = this.props;
    const storage = JSON.parse(localStorage.getItem('userInfo'));
    if(storage.usuario){
      axios.put('http://localhost:8080/profile/updateUser',{
        num: showInfo.data[0].numero_de_celular
      },
      {headers: {Authorization: storage.token}
      })
      .then((res) => {
        alert(res.data.message);
        this.handleClose();
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
    }else{
      axios.put('http://localhost:8080/taxista/cobrar',{
        id_taxista: showInfo.data[0].numero_de_identificacion
      },
      {headers: {Authorization: storage.token}
      })
      .then((res) => {
        alert(res.data.message);
        this.handleClose();
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
    }

  }


  onChanged(e,name){
    const textR = e.target.value
        switch(name){
            case 'numCel':
                return( 
                    this.setState({
                        numText: textR.replace(/[^0-9]/g, '')}))
            case 'pass':
                return(
                    this.setState({
                        passText: textR
                    })
                )                    
        }

  }

  submitForm(e){
    e.preventDefault();
    const storage = JSON.parse(localStorage.getItem('userInfo'));
    const r = window.confirm("¿Esta seguro que quiere eliminar la cuenta?");
    if(r){
      axios.delete('http://localhost:8080/profile/deleteUser',{data:{
        num: this.state.numText,
        pass: this.state.passText 
      }, headers: {Authorization: storage.token}})
      .then((res) => {
        const {isLogOut} = this.props;
        isLogOut();
      })
      .catch((err) => {
        console.log(err.response);
      });
    }else{
      this.setState({
        numText: '',
        passText: '',
        showDelete: false  
      })
      this.handleClose();  
    } 
  }

  saveChanges(e){
    const {showInfo,isAuthenticated,showInfoAction} = this.props;
    const storage = JSON.parse(localStorage.getItem('userInfo'));
    e.preventDefault();
    const r = window.confirm("¿Desea guardar los cambios?");  
    if(r){
      axios.put('http://localhost:8080/profile/updateUser',{
        cel: showInfo.data[0].numero_de_celular,
        nombre: this.state.textNombre,
        apellido: this.state.textApellido
      },{headers: {Authorization: storage.token}})
      .then((res) =>{
        window.alert("Usuario actualizado con éxito");
        const usuario = {
          num_cel_u: showInfo.data[0].numero_de_celular,
          nombre: this.state.textNombre,
          apellido: this.state.textApellido,
          role: storage.usuario.role
        }

        isAuthenticated({
          ok: true,
          token: storage.token,
          usuario   
        });
        
        this.setState({
          textNombre: '',
          textApellido: '',
          modif: false
        });

        showInfoAction(false,{});

      })
      .catch((err) => {
        console.log(err.response.data);  
      })
    }else{
      this.setState({
        textNombre: '',
        textApellido: '',
        modif: false,
        showDelete:false  
      });
    }

  }

  handlerChange(e){
    const textR = e.target.value;
    const id = e.target.id;
    switch(id){
      case 'nombre':
        this.setState({
          textNombre: textR   
        });
        break;
       
      case 'apellido':
        this.setState({
          textApellido: textR
        });
        break;  
    }      
  }

  handleClose() {
    const {showInfoAction} = this.props;
    showInfoAction(false,{});    
  }


  render() {
    const {showInfo} = this.props;  
    return (
        <>
        <Modal size="sm" show={this.state.showDelete} onHide={(e) => this.setState({ showDelete:false, numText: '',passText: ''})} centered>
          <Modal.Header closeButton>
          <Modal.Title>Eliminar perfil</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form onSubmit={(e) => this.submitForm(e)}>
              <Form.Group controlId="formID">
              <Form.Label>Usuario</Form.Label>
              <Form.Control placeholder="Digite su num celular..." onChange={event => this.onChanged(event,'numCel')} value={this.state.numText}/>
              </Form.Group>

              <Form.Group controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" placeholder="Digite la contraseña" onChange={event => this.onChanged(event,'pass')} value={this.state.passText}/>
              </Form.Group>
              <Button variant="warning" type="submit">
                Eliminar
              </Button>
          </Form>
          </Modal.Body>
        </Modal>
        <Modal
          size="lg"
          show={this.props.showInfo.show}
          onHide={this.handleClose}
        >
          <Modal.Header closeButton>
            <Modal.Title>Perfil</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div>
                <Row>
                  <Col md={12}>
                    <Row>
                      <Col md={3}>
                        <i className="fas fa-user fa-7x"></i>
                      </Col>
                      <Col md={6}>
                        <Form.Group as={Row}>
                          <Form.Label column sm="3">{showInfo.data.role === "User" ? "Usuario:" : "Taxista:"}</Form.Label>
                          <Col sm="9">
                          {this.state.modif?<Form.Control placeholder="Escriba nuevo nombre..." value={this.state.textNombre} onChange={this.handlerChange} id='nombre'></Form.Control>:<Form.Label column sm="3">{showInfo.data[0] ? `${showInfo.data[0].nombre_completo}`: ""}</Form.Label>}
                          {this.state.modif?<Form.Control placeholder="Escriba nuevo apellido..." value={this.state.textApellido} onChange={this.handlerChange} id='apellido'></Form.Control>:<></>}
                          </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                          <Form.Label column sm="3">Km recorridos: </Form.Label>
                          <Col sm="9">
                          <Form.Label column sm="3">{showInfo.data[0] ? `${showInfo.data[0].distancia_total_viajada}`: ""}</Form.Label>
                          </Col>
                        </Form.Group>
                        {showInfo.data.role === "Taxista"?                         <Form.Group as={Row}>
                          <Form.Label column sm="3">ID:  </Form.Label>
                          <Col sm="9">
                          <Form.Label column sm="3">{showInfo.data[0] ? `${showInfo.data[0].numero_de_identificacion}`: ""}</Form.Label>
                          </Col>
                        </Form.Group>:<></>}
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                          <Form.Label column sm="3">Teléfono: </Form.Label>
                          <Col sm="9">
                            <Form.Label column sm="3">{showInfo.data[0] ? `${showInfo.data[0].numero_de_celular}`: ""}</Form.Label>
                          </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                          <Form.Label column sm="3">Numero de viajes: </Form.Label>
                          <Col sm="9">
                            <Form.Label column sm="3">{showInfo.data[0] ? `${showInfo.data[0].numero_de_viajes}`: ""}</Form.Label>
                          </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                          <Form.Label column sm="3">Deuda</Form.Label>
                          <Col sm="9">
                            {showInfo.data.role === "User"?<Form.Label column sm="3">{showInfo.data[0] ? `${showInfo.data[0].deuda}`: ""}</Form.Label>:<Form.Label column sm="3">{showInfo.data[0] ? `${showInfo.data[0].saldo}`: ""}</Form.Label>}
                          </Col>
                        </Form.Group>
                      </Col>
                      <Col md={3}>

                        <ButtonGroup vertical>
                          {this.state.modif?<Button variant="secondary" onClick={(e) => this.setState({ modif:false })}><i className="fas fa-cog fa-4x"></i>
                            Cancelar</Button>:<Button variant="secondary" onClick={(e) => this.setState({ modif:true })}><i className="fas fa-cog fa-4x"></i>
                            Modificar</Button>}
                            {showInfo.data.role === "User"?<Button variant="warning" onClick={(e) => {this.handleClose(); this.setState({showDelete:true})}}>
                            <i className="fas fa-trash-alt fa-4x"></i>
                            Eliminar cuenta</Button>:<></>}
                          </ButtonGroup>
                          <ButtonGroup vertical>
                          <br />
                          <br />
                          <br />
                          <Button variant="success" onClick={this.pagar}>
                          <i className="fas fa-money-check-alt fa-3x"></i>
                            {showInfo.data.role === "User"? "Pagar":"Cobrar"}</Button>
                        </ButtonGroup>

                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </Form>
          </Modal.Body>
            <Modal.Footer>
              {this.state.modif?<Button variant="info" onClick={this.saveChanges}>Guardar</Button>:<></>}
              <Button variant="secondary" onClick={this.handleClose}>
                Salir</Button>
            </Modal.Footer>
        </Modal>
      </>
        );
      }
    }

    const mapStateToProps = state => ({
        ...state,
        showInfo: state.showInfo
    });
    
    const mapDispatchToProps = {
        showInfoAction,
        isAuthenticated,
        isLogOut
    };


    
export default connect(mapStateToProps,mapDispatchToProps)(myInfo);