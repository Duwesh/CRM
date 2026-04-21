import { Op } from 'sequelize';
import { Client, ClientService as ServiceModel, sequelize } from '../models/index.js';

export const getClients = async (firmId, page = 1, limit = 10, search = '') => {
  const offset = (page - 1) * limit;
  
  const where = { firm_id: firmId, is_deleted: false };
  
  if (search) {
    where[Op.and] = [
      {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { pan: { [Op.iLike]: `%${search}%` } },
          { gstin: { [Op.iLike]: `%${search}%` } }
        ]
      }
    ];
  }

  const { rows: clients, count: total } = await Client.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']]
  });

  return {
    clients,
    total,
    page,
    limit
  };
};

export const createClient = async (firmId, data) => {
  return await sequelize.transaction(async (t) => {
    const client = await Client.create({
      ...data,
      firm_id: firmId
    }, { transaction: t });

    if (data.services && Array.isArray(data.services)) {
      const services = data.services.map(name => ({
        client_id: client.id,
        service_name: name
      }));
      await ServiceModel.bulkCreate(services, { transaction: t });
    }

    return client;
  });
};

export const getClientById = async (firmId, clientId) => {
  const client = await Client.findOne({
    where: { id: clientId, firm_id: firmId, is_deleted: false },
    include: [{
      model: ServiceModel,
      attributes: ['service_name']
    }]
  });

  if (!client) return null;

  return {
    ...client.toJSON(),
    services: client.ClientServices?.map(s => s.service_name) || []
  };
};

export const updateClient = async (firmId, clientId, data) => {
  return await sequelize.transaction(async (t) => {
    const client = await Client.findOne({
      where: { id: clientId, firm_id: firmId, is_deleted: false },
      transaction: t
    });

    if (!client) return null;

    await client.update(data, { transaction: t });

    if (data.services && Array.isArray(data.services)) {
      // Delete old services
      await ServiceModel.destroy({
        where: { client_id: clientId },
        transaction: t
      });
      
      // Add new services
      const services = data.services.map(name => ({
        client_id: clientId,
        service_name: name
      }));
      await ServiceModel.bulkCreate(services, { transaction: t });
    }

    return client;
  });
};

export const deleteClient = async (firmId, clientId) => {
  const [updatedCount] = await Client.update(
    { is_deleted: true },
    { where: { id: clientId, firm_id: firmId, is_deleted: false } }
  );
  return updatedCount > 0;
};

export const getClientStats = async (firmId) => {
  const total = await Client.count({
    where: { firm_id: firmId, is_deleted: false }
  });

  const active = await Client.count({
    where: { firm_id: firmId, is_deleted: false, status: 'active' }
  });

  const withPan = await Client.count({
    where: { 
      firm_id: firmId, 
      is_deleted: false, 
      pan: { [Op.ne]: null, [Op.not]: '' } 
    }
  });

  return {
    total,
    active,
    inactive: total - active,
    withPan
  };
};

