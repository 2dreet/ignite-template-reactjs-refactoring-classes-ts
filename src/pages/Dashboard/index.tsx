import {Header} from '../../components/Header';
import api from '../../services/api';
import {Food} from '../../components/Food';
import {ModalAddFood} from '../../components/ModalAddFood';
import {ModalEditFood} from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';
import { useState } from 'react';
import { useEffect } from 'react';
import { FoodInterface } from '../../models/FoodInterface';

export function Dashboard() {
  
  const [ foods, setFoods ] = useState<FoodInterface[]>([]);
  const [ editingFood, setEditingFood ] = useState<FoodInterface>({} as FoodInterface);
  const [ modalOpen, setModalOpen ] = useState(false);
  const [ editModalOpen, setEditModalOpen ] = useState(false);

  useEffect(()=> {
    async function loadFoods() {
      const response = await api.get('/foods');
      setFoods(response.data);
    }

    loadFoods();
  }, [])

  async function handleAddFood(food: Omit<FoodInterface, 'id' | 'available'>){
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });
      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food: FoodInterface) {
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const index = foods.findIndex(f => f.id === editingFood.id);
      
      if(index >= 0) {
        foods[index] = foodUpdated.data   
        setFoods([...foods]);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number) {
    await api.delete(`/foods/${id}`);
    setFoods([...foods.filter(food => food.id !== id)]);
  }

  function toggleModal() {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal() {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: FoodInterface){
    setEditingFood(food);
    setEditModalOpen(true);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
