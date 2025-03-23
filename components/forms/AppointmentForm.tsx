"use client";


import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import { Doctors } from "@/constants";
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions";
import { getAppointmentSchema } from "@/lib/validation";
import { Appointment } from "@/types/appwrite.types";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { SelectItem } from "../ui/select";

interface AppointmentProps {
  userId:string;
  patientId:string;
  type:"create" | "cancel" | "schedule";
  appointment?: Appointment;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

export const AppointmentForm = ({ userId , patientId,type,appointment,setOpen}:AppointmentProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const AppointmentFormValidation =  getAppointmentSchema(type)
  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver:zodResolver(AppointmentFormValidation),
    defaultValues:{
      primaryPhysician: appointment ? appointment.primaryPhysician : "" ,
      schedule:appointment ? new Date(appointment?.schedule) : new Date(Date.now()),
      reason:appointment?.reason || "",
      note:appointment?.note || "",
      cancellationReason:appointment?.cancellationReason || "",

    }
  })

  const onSubmit = async (values: z.infer<typeof AppointmentFormValidation>) => {
    setIsLoading(true);
    let status;
    switch (type){
      case "schedule":
        status = "scheduled"
        break;
      case "create":
        status = "pending"
        break;
      case "cancel":
        status = "cancelled"
        break;
      default:
        break;
    }
    try{
      if(type === "create" && patientId){
        const appointment = {
          userId,
          patient:patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          reason:values.reason ?? "No Reason Provided",
          status: status as Status,
          note: values.note
        };
        const newAppointment = await createAppointment(appointment);
        if(newAppointment){
          form.reset();
          router.push(
            `/patients/${userId}/new-appointment/success?appointmentId=${newAppointment.$id}`
          );
        }
      }else{
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          appointment: {
            primaryPhysician: values.primaryPhysician,
            schedule: new Date(values.schedule),
            status: status as Status,
            cancellationReason: values.cancellationReason,
          },
          type,
        };
        
        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
        }
      }
      
    }catch(error){
      console.log(error)
    }

    setIsLoading(false);
  };


  let buttonLabel;

  switch (type){
    case 'cancel':
      buttonLabel = "Cancel Appointment"
      break;
    case "create":
      buttonLabel = "Create Appointment"
      break;
    case "schedule":
      buttonLabel = "Schedule Appointment"
      break;
    default:
      break;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        
        { type !== "cancel" &&
          <>
            <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="primaryPhysician"
            label="Primary Physician"
            placeholder="Select a physician"
           >
            {
              Doctors.map((doctor)=>{
                return (
                  <SelectItem key={doctor.name} value={doctor.name} >
                    <div className="flex cursor-pointer items-center gap-2 ">
                      <Image
                        src={doctor.image}
                        width={32}
                        height={32}
                        alt={doctor.name}
                        className='rounded-full border border-dark-500'
                      />
                      <p>{doctor.name}</p>
                    </div>
                  </SelectItem>
                )
              })
            }
           </CustomFormField>
           <CustomFormField 
            fieldType={FormFieldType.DATE_PICKER}
            control={form.control}
            name="schedule"
            label="Expected appointment date"
            showTimeSelect
            dateFormat="dd/mm/yyyy - h:mm aa"

           />
           <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Reason for appointment"
                placeholder="Enter reason for appointment"
              />
              <CustomFormField 
               fieldType={FormFieldType.TEXTAREA}
               control={form.control}
               name="note"
               label="Notes"
               placeholder="Notes.."
              />
           </div>
          </>
        }
        {type === "cancel" && 
         <>
            <CustomFormField 
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="cancellationReason"
              label="Reason for cancellation"
              placeholder="Enter reason for cancellation"
            />

         </>
        }
        <SubmitButton isLoading={isLoading} className={`${type === "cancel" ? 'shad-danger-btn' : 'shad-primary-btn'} w-full`}>{buttonLabel}</SubmitButton>
      </form>
    </Form>
  );
};
