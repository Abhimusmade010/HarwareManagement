import { maintenanceLogin } from "../services/maintainanceService.js";
// import { getAllComplaints } from "../services/userService.js";

// import { updateComplaintStatus } from "../services/maintainanceService.js";
const maintenanceLoginController =async (req,res)=>{
    try{
        console.log("INSDIE TRY block OD TRY IN maintenanceLoginController ")
        const data=req.body;
        console.log("Data which contains password:",data)
        const result=await maintenanceLogin(data);
        res.status(200).json(result);            //200 status code is for successfully login  used for geenreal success!!!
  
    }
    catch(error){
        console.log("inside the catch bloxk of the adminlo controller");
        res.status(401).json({error:error.message});
    }

}



// const fetchAllComplaintsForMaintenance = async (req, res) => {
//   try {
//     const complaints = await getAllComplaints();

//     res.status(200).json({
//       success: true,
//       complaints,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch complaints",
//     });
//   }
// };


// const updateStatus=async(req,res)=>{
    
//     try{
//         const  {complaintId} =req.params;
//         const {status}=req.body;

//         const result=await updateComplaintStatus(complaintId,status);
//         console.log("inside updatestauts controller ",result)
//         res.status(200).json({
//             success: true,
//             result
//         });
        

//     }catch(error){
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch complaints",
//             });
//     }
// }

export {maintenanceLoginController};

