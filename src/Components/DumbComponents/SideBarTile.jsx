import React from 'react';

const SideBarTile = ({ icon, label, active, onClick }) => {
    return (
        <>
            
        </>
        // <div
        //     className={`sidebar-tile${active ? ' active' : ''}`}
        //     onClick={onClick}
        //     style={{
        //         display: 'flex',
        //         alignItems: 'center',
        //         padding: '12px 16px',
        //         cursor: 'pointer',
        //         background: active ? '#f0f4ff' : 'transparent',
        //         borderRadius: '6px',
        //         transition: 'background 0.2s',
        //     }}
        // >
        //     {icon && (
        //         <span style={{ marginRight: '12px', fontSize: '20px' }}>
        //             {icon}
        //         </span>
        //     )}
        //     <span style={{ fontWeight: active ? 'bold' : 'normal' }}>{label}</span>
        // </div>
    );
};

export default SideBarTile;