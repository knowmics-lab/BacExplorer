import React from 'react';
import Nav from 'react-bootstrap/Nav';

export default function NavGuide() {
  return (
    <Nav defaultActiveKey="#home" className="flex-column nav-col">
      <Nav.Link href="#config">Setup</Nav.Link>
      <hr className='line'/>
      <Nav.Link href="#req">Technical requirements</Nav.Link>
      <hr className='line'/>
      <Nav.Link href="#out">Output organization</Nav.Link>
      <hr className='line'/>
      <Nav.Link href="#params">Parameters setting</Nav.Link>
    </Nav>
  );
}