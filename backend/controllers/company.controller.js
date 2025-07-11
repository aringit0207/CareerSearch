import { Company } from '../models/company.model.js';
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const registerCompany = async (req,res) => {
    try {
        const { companyName } = req.body;
        if(!companyName) {
            return res.status(400).json({
                message: "Company name required!",
                success: false
            });
        }

        let company = await Company.findOne({name: companyName});
        if(company) {
            return res.status(400).json({
                message: "Company name already exists!",
                success: false
            });
        }

        company = await Company.create({
            name: companyName,
            userId: req.id
        })

        return res.status(201).json({
            message: "Company registered successfully!",
            company,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

export const getCompany = async (req,res) => {
    try {
        const userId = req.id;
        const companies = await Company.find({userId});
        if(!companies) {
            return res.status(401).json({
                message: "Companies not found",
                success: false
            });
        }

        return res.status(200).json({
            companies,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }
        return res.status(200).json({
            company,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

export const updateCompany = async (req, res) => {
    try {
      const { name, description, website, location } = req.body;
      const file = req.file;
      
      // Initialize updateData with basic fields
      const updateData = { name, description, website, location };
      
      // Only process file if it exists
      if (file) {
        try {
          const fileUri = getDataUri(file);
          if (fileUri) {
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            updateData.logo = cloudResponse.secure_url;
          }
        } catch (fileError) {
          console.log("File upload error:", fileError);
          return res.status(400).json({
            message: "Error uploading file",
            success: false
          });
        }
      }
  
      const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });
      
      if (!company) {
        return res.status(404).json({
          message: "Company not found.",
          success: false
        });
      }
  
      return res.status(200).json({
        message: "Company information updated successfully",
        success: true,
        company // Return the updated company data
      });
  
    } catch (error) {
      console.log("Update company error:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false
      });
    }
  };