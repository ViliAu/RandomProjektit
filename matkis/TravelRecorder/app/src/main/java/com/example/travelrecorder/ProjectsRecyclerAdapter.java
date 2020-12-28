package com.example.travelrecorder;

import android.annotation.SuppressLint;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

public class ProjectsRecyclerAdapter extends RecyclerView.Adapter<ProjectsRecyclerAdapter.CustomerAccountViewHolder> {

    private ArrayList<String> projectList;
    private OnItemClickListener clickListener;

    public interface OnItemClickListener {
        void onDeleteItemClick(int position);
    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        clickListener = listener;
    }

    public static class CustomerAccountViewHolder extends RecyclerView.ViewHolder {
        public ImageView deleteImage;
        public TextView projectName;

        public CustomerAccountViewHolder(@NonNull View itemView, final OnItemClickListener listener) {
            super(itemView);
            deleteImage = itemView.findViewById(R.id.imageview_delete);
            projectName = itemView.findViewById(R.id.tw_project_name;

            deleteImage.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (listener != null) {
                        int position = getAdapterPosition();
                        if (position != RecyclerView.NO_POSITION) {
                            listener.onDeleteItemClick(position);
                        }
                    }
                }
            });
        }
    }

    public ProjectsRecyclerAdapter(ArrayList<String> projects) {
        projectList = projects;
    }

    @NonNull
    @Override
    public CustomerAccountViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.card_customer_pending_payment, parent, false);
        return new CustomerAccountViewHolder(v, clickListener);
    }

    @SuppressLint("SetTextI18n")
    @Override
    public void onBindViewHolder(@NonNull CustomerAccountViewHolder holder, int position) {
        PendingPayment payment = paymentList.get(position);
        String recurrence = "";
        switch (payment.isReoccurring()) {
            case 0 :
                recurrence = "NOT RECURRING";
                break;
            case 1:
                recurrence = "RECURRING WEEKLY";
                break;
            case 2:
                recurrence = "RECURRING MONTHLY";
                break;
        }
        holder.recurrence.setText(recurrence);
        holder.amount.setText(String.format(Locale.GERMANY, "%.2f€", payment.getAmount()));

        // Money lost
        if (payment.getAccountFrom().equals(payment.getTargetAccount())) {
            holder.accountNumber.setText("To: "+payment.getAccountFrom());
            holder.amount.setText(String.format(Locale.GERMANY, "-%.2f€", payment.getAmount()));
            holder.deleteImage.setImageResource(R.drawable.ic_delete);
        }
        // Money gained
        else {
            holder.accountNumber.setText("From: " + payment.getAccountFrom());
            if (payment.isInterest())
                holder.amount.setText(String.format(Locale.GERMANY, "+%.2f%%", payment.getAmount()));
            else
                holder.amount.setText(String.format(Locale.GERMANY, "+%.2f€", payment.getAmount()));
            holder.amount.setTextColor(Color.rgb(153, 204, 0));
            holder.deleteImage.setVisibility(View.INVISIBLE);
        }

        if (payment.getDate().before(new Date(time.today())))
            holder.dueDate.setTextColor(Color.rgb(255,68,68));
        holder.dueDate.setText("Due date: "+time.getReadableDate(payment.getDate().getTime()));
        holder.message.setText("Message: "+payment.getMessage());
    }

    @Override
    public int getItemCount() {
        if (paymentList == null)
            return 0;
        else
            return paymentList.size();
    }

}
