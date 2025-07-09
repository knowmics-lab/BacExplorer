import React, { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import { Dropdown, DropdownItem } from 'react-bootstrap';

export default function NavGuide() {
  const [show, setShow] = useState(false);
  
  const navigate = (page) =>{
    console.log(`Navigando verso ${page}`);
    window.api.onNavigate(page);
  }

  return (
    <Nav defaultActiveKey="#home" className="flex-column nav-col">
      <Dropdown as={NavItem}>
        <Dropdown.Toggle as={NavLink}>Setup</Dropdown.Toggle>
          <Dropdown.Menu>
            <DropdownItem></DropdownItem>
            <Nav.Link href="#config">Create environment</Nav.Link>
            <hr className='line'/>
            <Nav.Link href="#req">System requirements</Nav.Link>
            <hr className='line'/>
            <Nav.Link href="#out">Output organization</Nav.Link>
            <hr className='line'/>
            <Nav.Link href="#params">Parameters setting</Nav.Link>
          </Dropdown.Menu>
      </Dropdown>
      <hr className='line' style={{border:"dotted"}}/>
      <NavLink onClick={() => navigate("settings")}>Analysis</NavLink>

    </Nav>
  );
}
      