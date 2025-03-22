"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentForm } from "./forms/AppointmentForm";

import "react-datepicker/dist/react-datepicker.css";

interface AppointmentModelProps {
  patientId:string
  userId:string
  type:'schedule' | 'cancel'
  title:string
  description:string
  appointment?:Appointment
}

export const AppointmentModal = ({
  patientId,
  userId,
  type,
  title,
  description,
  appointment
}:AppointmentModelProps)=>{

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'ghost'} className={`capitalize ml-2 ${(type === 'schedule' ? 'text-green-500' : 'text-red-800')}`} >{type}</Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle className="capitalize">{type} Appointment</DialogTitle>
          <DialogDescription>
            Please fill in the following details to { type} appointment
          </DialogDescription>
        </DialogHeader>
        <AppointmentForm 
          userId={userId}
          patientId={patientId}
          type={type}
          appointment={appointment}
          setOpen={setOpen}
        />
        </DialogContent>
    </Dialog>
  )
}