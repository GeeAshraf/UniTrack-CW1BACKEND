 const requests = [
    { id: 1,
        title: 'Air Conditioner Repair',
        location: 'Building A, Room 101',
        category: 'Maintenance',
        priority: 'High',
        description: 'The air conditioner is not cooling properly.',
        status: 'pending',
        technician_id: null },
    { id: 2,
        title: 'Network Connectivity Issue',
        location: 'Building B, Room 202',
        category: 'IT Support',
        priority: 'Medium',
        description: 'Intermittent network connectivity in the room.',
        status: 'in_progress',
        technician_id: 5 },
    { id: 3,
        title: 'Projector Malfunction',
        location: 'Building C, Conference Room',
        category: 'AV Support',
        priority: 'Low',
        description: 'The projector is not turning on.',
        status: 'completed',
        technician_id: 3 },

    { id: 4,
        title: 'Heating System Issue',
        location: 'Building D, Room 303',
        category: 'Maintenance',
        priority: 'High',
        description: 'The heating system is not working.',
        status: 'pending',
        technician_id: null },

];

    

function GetRequestSummary() {
  let summary = {
    totalRequests: requests.length,
    pending: 0,
    in_progress: 0,
    completed: 0
  };  

    for (let i = 0;i < requests.length;i++) {
        const req = requests[i];

        if (req.status === 'pending') summary.pending ++;
        if (req.status === 'assigned') summary.assigned ++;
        if (req.status === 'in_progress') summary.in_progress ++;
        if (req.status === 'completed') summary.completed ++;
        }
    
    return summary;
}  

module.exports = {GetRequestSummary, requests};
        