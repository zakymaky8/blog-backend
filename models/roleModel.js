const { PrismaClient }  = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    getRoles: async () => {
        return await prisma.roles.findMany();
    },

    getOneRole: async (role_id) => {
        return await prisma.roles.findFirst({ where: { role_id } });
    },
    
    getOpenRoles: async () => {
        return await prisma.open_Role.findMany({ include: { role: true }, orderBy: { createdAt: "desc" } });
    },

    getSingleOpenRole: async (open_id) => {
        return await prisma.open_Role.findFirst({ where: { open_id } })
    },


    createAdminOnlyOpenRole: async (reqBody, role_id) => {

        await prisma.open_Role.create({
            data: {
                isActive: reqBody.isActive === "on" ? true : false,
                notes: reqBody.notes,
                slots: parseInt(reqBody.slots),
                role_id: role_id,
                description: reqBody.description,
                title: reqBody.title
            },
        })
        return;
    },


    updateAdminOnlyOpenRole: async (open_id, reqBody, roleId) => {
        const openRoleExists = await prisma.open_Role.findUnique({ where: { open_id } })
        if (!openRoleExists) {
            return false
        }

        const updatedOpenRole = await prisma.open_Role.update({
            where: { open_id },
            data: {
                isActive: reqBody.isActive === "on" ? true : false,
                slots: parseInt(reqBody.slots),
                role_id: roleId,
                title: reqBody.title,
                description: reqBody.description,
                notes: reqBody.notes,
            }
        })
        return updatedOpenRole
    },


    deleteAdminOnlyOpenRole: async(open_id) => {
        const openRoleExists = await prisma.open_Role.findUnique({ where: { open_id } });

        if (!openRoleExists) {
            return false
        }

        await prisma.open_Role.delete({
            where: { open_id }
        })
        return
    },

    getAdminOnlyRoleRequests: async () => {
        return await prisma.role_Request.findMany({ include: { role: true, user: true }, orderBy: { createdAt: "desc" } })
    },
// for admin
    getSingleRoleRequest: async (request_id) => {
        return await prisma.role_Request.findFirst({ where: { request_id } })
    },

    getSingleRoleUsingRoleName: async (role_name) => {
        return await prisma.roles.findFirst({ where: { name: role_name } })
    },

    // your requests for MEC
    getOnesRoleRequest: async (user_id) => {
        return await prisma.role_Request.findMany({
            where: { user_id },
            include: {
                role: true
            }
        })
    },

    createMECOnlyRoleRequest: async (role_id, reqBody, user_id) => {
        await prisma.role_Request.create({
            data: {
                contact: reqBody.contact,
                value_proposition: reqBody.value_proposition,
                role_id: role_id,
                user_id: user_id
            }
        })
        return;
    },

    updateMECOnlyRoleRequest: async (user_id, request_id, reqBody, roleId) => {

        const roleRequestExists = await prisma.role_Request.findUnique({ where: { request_id, user_id } });

        if (!roleRequestExists || (roleRequestExists.user_id !== user_id)) {
            return false
        }

        const updatedRequest = await prisma.role_Request.update({
            where: { request_id },
            data: {
                role_id: roleId,
                value_proposition: reqBody.value_proposition,
                contact: reqBody.contact,
            }
        })
        return true
    },

    deleteMECOnlyRoleRequest: async (user, request_id) => {

        const requestExists = await prisma.role_Request.findUnique({ where: { request_id } });

        if (!requestExists) {
            return false
        }

        if (user.Role === "ADMIN" || requestExists.user_id === user.users_id) {
            await prisma.role_Request.delete({
                where: { request_id }
            })
            return true;
        }

        return false;
    },

    changeUserRoleStatus: async (userId, reqBody) => {
        const userExists = await prisma.users.findUnique({ where: { users_id: reqBody.userId } });
        const roleChanger = await prisma.users.findUnique( { where: { users_id: userId } } );

        if (!userExists || roleChanger.Role !== "ADMIN") {
            return false
        }

        await prisma.users.update({ 
            where: { users_id: reqBody.userId },

            data: {
                Role: reqBody.changedRole
            }
         })


        if (reqBody.drive === "request") {
            await prisma.role_Request.update({
                where: { user_id: reqBody.userId, request_id: reqBody.requestId },
                data: {
                    status: "APPROVED",
                    reviewed_at: new Date(),
                    reviewed_by: userId
                }
            })
        }

        return true

    },

    rejectRoleRequest: async (userId, requestId) => {
        await prisma.role_Request.update({
            where: { request_id: requestId },
            data: {
                status: "REJECTED",
                reviewed_at: new Date(),
                reviewed_by: userId
            }
        })
        return;
    },

// Four role to be created for the first and last time.
    initiateRolesAllocation: async () => {
        const roles = await prisma.roles.findMany();

        const allRoles = ["ADMIN", "CREATOR", "EDITOR", "MEMBER"];
        

        if (roles.length) {
            return { success: false, data: null }
        }
        
        const rolesCreate = await Promise.all(allRoles.map(async role => await prisma.roles.create( { data: { name: role }})))

        return { success: true, data: rolesCreate }
    }
}