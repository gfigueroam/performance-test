const mockTeacherId = '9bba9b76-39af-4dbb-87cd-eb04dcde1891';
const mockStudentId = '2c5e578d-a6fe-41de-8ef1-9f259fc14929';

// Mock an access function that has a pre-defined teacher/student relationship
//  Assume mockTeacherId is teacher of mockStudentId but no other user guids
//  Any other teacher/student relationships should return false and deny access
function hasAccessTo(requestor, owner) {
  return (requestor === mockTeacherId && owner === mockStudentId);
}

export default {
  hasAccessTo,
  mockStudentId,
  mockTeacherId,
};
