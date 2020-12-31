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
            projectName = itemView.findViewById(R.id.tw_project_name);

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
        // INFLATE CARD HERE
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.card_project, parent, false);
        return new CustomerAccountViewHolder(v, clickListener);
    }

    @SuppressLint("SetTextI18n")
    @Override
    public void onBindViewHolder(@NonNull CustomerAccountViewHolder holder, int position) {
        // ASSIGN PROJECT FOLDER NAME HERE TO THE CARD!!!

    }

    @Override
    public int getItemCount() {
        if (projectList == null)
            return 0;
        else
            return projectList.size();
    }

}
