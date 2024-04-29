import { client } from 'lib/crud';
import { Box, Flex, Input, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Textarea, Tag, TagLabel, TagCloseButton, IconButton } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const Index = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '', labels: [] });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editMode, setEditMode] = useState(false);

  const handleSaveNote = () => {
    if (editMode) {
      const updatedNotes = notes.map(note => note.id === currentNote.id ? currentNote : note);
      setNotes(updatedNotes);
      client.set(`note:${currentNote.id}`, currentNote);
    } else {
      const newNote = { ...currentNote, id: `note:${Date.now()}` };
      const newNotes = [...notes, newNote];
      setNotes(newNotes);
      client.set(newNote.id, newNote);
    }
    onClose();
    setCurrentNote({ title: '', content: '', labels: [] });
    setEditMode(false);
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);
    setEditMode(true);
    onOpen();
  };

  useEffect(() => {
    client.getWithPrefix('note:').then(data => {
      if (data) {
        const notes = data.map(item => ({ ...item.value, id: item.key }));
        setNotes(notes);
      }
    });
  }, []);

  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    client.delete(noteId);
  };

  const handleAddLabel = (label) => {
    if (!currentNote.labels.includes(label)) {
      setCurrentNote({ ...currentNote, labels: [...currentNote.labels, label] });
    }
  };

  const handleRemoveLabel = (label) => {
    setCurrentNote({ ...currentNote, labels: currentNote.labels.filter(l => l !== label) });
  };

  return (
    <Box p={5}>
      <Flex justifyContent="space-between" mb={4}>
        <Input placeholder="Search notes..." />
        <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={onOpen}>New Note</Button>
      </Flex>
      <Flex wrap="wrap" gap={4}>
        {notes.map(note => (
          <Box key={note.id} p={3} boxShadow="md" borderRadius="md" bg="gray.100" width="250px">
            <Flex justifyContent="space-between" alignItems="center">
              <Box fontSize="xl" fontWeight="bold">{note.title}</Box>
              <IconButton aria-label="Delete note" icon={<FaTrash />} onClick={() => handleDeleteNote(note.id)} />
            </Flex>
            <Box mt={2}>{note.content}</Box>
            <Flex mt={2}>
              {note.labels.map(label => (
                <Tag size="sm" key={label} borderRadius="full" variant="solid" colorScheme="green" mr={1}>
                  <TagLabel>{label}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveLabel(label)} />
                </Tag>
              ))}
            </Flex>
          </Box>
        ))}
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editMode ? 'Edit Note' : 'New Note'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder="Title" value={currentNote.title} onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })} mb={3} />
            <Textarea placeholder="Content" value={currentNote.content} onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })} />
            <Input placeholder="Add a label" onKeyDown={(e) => e.key === 'Enter' && handleAddLabel(e.target.value)} mb={3} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveNote}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Index;